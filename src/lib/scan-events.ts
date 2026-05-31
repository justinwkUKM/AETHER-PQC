import type { ScanEvent, ScanEventLevel } from "@prisma/client";

export type SerializedScanEvent = {
  id: string;
  level: ScanEventLevel;
  message: string;
  createdAt: string;
  artifactId: string | null;
};

export type LiveScanEvent =
  | {
      type: "scan-event";
      event: SerializedScanEvent;
    }
  | {
      type: "heartbeat";
      message: string;
      elapsedMs: number;
    };

export function serializeScanEvent(event: Pick<ScanEvent, "id" | "level" | "message" | "createdAt" | "artifactId">): SerializedScanEvent {
  return {
    id: event.id,
    level: event.level,
    message: event.message,
    createdAt: event.createdAt.toISOString(),
    artifactId: event.artifactId
  };
}

export function mergeScanEvents(existing: SerializedScanEvent[], incoming: SerializedScanEvent[]) {
  const events = new Map(existing.map((event) => [event.id, event]));
  for (const event of incoming) {
    events.set(event.id, event);
  }
  return Array.from(events.values()).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
}

export function latestScanEventTimestamp(events: SerializedScanEvent[]) {
  return events.length ? events[events.length - 1].createdAt : undefined;
}
