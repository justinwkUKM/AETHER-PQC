"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Activity, Radio, WifiOff } from "lucide-react";
import { latestScanEventTimestamp, mergeScanEvents, type LiveScanEvent, type SerializedScanEvent } from "@/lib/scan-events";

type ConnectionState = "CONNECTING" | "LIVE" | "POLLING" | "OFFLINE";

export function LiveScanConsole({ projectId, initialEvents }: { projectId: string; initialEvents: SerializedScanEvent[] }) {
  const [events, setEvents] = useState(() => mergeScanEvents([], initialEvents));
  const [heartbeat, setHeartbeat] = useState<{ message: string; elapsedMs: number } | null>(null);
  const [connectionState, setConnectionState] = useState<ConnectionState>("CONNECTING");
  const containerRef = useRef<HTMLDivElement>(null);
  const latestTimestamp = useMemo(() => latestScanEventTimestamp(events), [events]);
  const latestTimestampRef = useRef<string | undefined>(latestTimestamp);

  useEffect(() => {
    latestTimestampRef.current = latestTimestamp;
  }, [latestTimestamp]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const nearBottom = container.scrollHeight - container.scrollTop - container.clientHeight < 96;
    if (nearBottom) {
      container.scrollTop = container.scrollHeight;
    }
  }, [events, heartbeat]);

  useEffect(() => {
    let eventSource: EventSource | undefined;
    let pollInterval: ReturnType<typeof setInterval> | undefined;
    let closed = false;

    const applyEvents = (incoming: SerializedScanEvent[]) => {
      if (incoming.length === 0) return;
      setHeartbeat(null);
      setEvents((current) => mergeScanEvents(current, incoming));
    };

    const poll = async () => {
      try {
        const query = latestTimestampRef.current ? `?after=${encodeURIComponent(latestTimestampRef.current)}` : "";
        const response = await fetch(`/api/projects/${projectId}/scan-events${query}`, { cache: "no-store" });
        if (!response.ok) throw new Error("Polling failed");
        const payload = await response.json() as { events: SerializedScanEvent[] };
        applyEvents(payload.events);
        if (!closed) setConnectionState("POLLING");
      } catch {
        if (!closed) setConnectionState("OFFLINE");
      }
    };

    const startPolling = () => {
      if (pollInterval) return;
      setConnectionState("POLLING");
      poll();
      pollInterval = setInterval(poll, 2000);
    };

    if ("EventSource" in window) {
      eventSource = new EventSource(`/api/projects/${projectId}/scan-events/stream`);
      eventSource.addEventListener("open", () => setConnectionState("LIVE"));
      eventSource.addEventListener("scan-event", (event) => {
        const payload = JSON.parse((event as MessageEvent).data) as LiveScanEvent;
        if (payload.type === "scan-event") applyEvents([payload.event]);
      });
      eventSource.addEventListener("heartbeat", (event) => {
        const payload = JSON.parse((event as MessageEvent).data) as LiveScanEvent;
        if (payload.type === "heartbeat") {
          setHeartbeat({ message: payload.message, elapsedMs: payload.elapsedMs });
        }
      });
      eventSource.onerror = () => {
        eventSource?.close();
        startPolling();
      };
    } else {
      startPolling();
    }

    return () => {
      closed = true;
      eventSource?.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [projectId]);

  return (
    <aside className="aether-panel h-full overflow-hidden rounded-lg">
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-[#32e6ff]">Console core</p>
          <h2 className="mt-2 text-lg font-semibold text-slate-50">Activity log</h2>
        </div>
        <ConnectionBadge state={connectionState} />
      </div>
      <div ref={containerRef} className="max-h-[760px] space-y-3 overflow-y-auto p-5 font-mono text-xs">
        {events.length === 0 ? <p className="text-slate-500">System idle. Start by uploading the first artifact.</p> : null}
        {events.map((event) => (
          <ScanEventRow key={event.id} event={event} />
        ))}
        {heartbeat ? (
          <div className="rounded-md border border-[#32e6ff]/20 bg-[#32e6ff]/5 px-3 py-3 text-[#32e6ff]">
            <span className="mr-2 inline-flex h-2 w-2 animate-pulse rounded-full bg-[#32e6ff]" />
            <span className="mr-2 text-slate-500">[{formatElapsed(heartbeat.elapsedMs)}]</span>
            {heartbeat.message}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function ConnectionBadge({ state }: { state: ConnectionState }) {
  const live = state === "LIVE";
  const polling = state === "POLLING";
  return (
    <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.18em] ${
      live
        ? "border-emerald-400/25 bg-emerald-400/8 text-emerald-300"
        : polling
          ? "border-amber-400/25 bg-amber-400/8 text-amber-300"
          : "border-white/10 bg-white/3 text-slate-400"
    }`}>
      {live ? <Radio className="h-3 w-3" /> : polling ? <Activity className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
      {live ? "Live" : polling ? "Polling" : state === "CONNECTING" ? "Connecting" : "Offline"}
    </div>
  );
}

function ScanEventRow({ event }: { event: SerializedScanEvent }) {
  return (
    <div
      className={`rounded-md border px-3 py-3 ${
        event.level === "ERROR"
          ? "border-rose-500/20 bg-rose-500/8 text-rose-200"
          : event.level === "SUCCESS"
            ? "border-emerald-500/20 bg-emerald-500/8 text-emerald-200"
            : event.level === "WARN"
              ? "border-amber-500/20 bg-amber-500/8 text-amber-200"
              : "border-white/10 bg-white/3 text-slate-300"
      }`}
    >
      <span className="mr-2 text-slate-500">[{new Date(event.createdAt).toISOString().slice(11, 19)}]</span>
      {event.message}
    </div>
  );
}

function formatElapsed(elapsedMs: number) {
  const totalSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
