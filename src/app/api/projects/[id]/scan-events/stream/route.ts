import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { serializeScanEvent, type LiveScanEvent } from "@/lib/scan-events";
import { getApiProject, getApiUser } from "@/server/auth/api";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const encoder = new TextEncoder();
const heartbeatMessages = [
  "Gemini analysis still running",
  "Reasoning across artifact relationships",
  "Mapping exposure paths",
  "Reconciling graph duplicates"
];

function encodeEvent(payload: LiveScanEvent) {
  return encoder.encode(`event: ${payload.type}\ndata: ${JSON.stringify(payload)}\n\n`);
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const project = await getApiProject(user.id, id);
  if (!project) return new Response("Not found", { status: 404 });

  const startedAt = Date.now();
  const sentIds = new Set<string>();
  let heartbeatIndex = 0;

  const stream = new ReadableStream({
    async start(controller) {
      let closed = false;
      const close = () => {
        closed = true;
        clearInterval(scanInterval);
        clearInterval(heartbeatInterval);
        try {
          controller.close();
        } catch {
          // The client may have already disconnected.
        }
      };

      const sendRecentEvents = async () => {
        if (closed) return;
        const events = await prisma.scanEvent.findMany({
          where: { projectId: id },
          orderBy: { createdAt: "desc" },
          take: 80
        });

        for (const event of events.reverse()) {
          if (sentIds.has(event.id)) continue;
          sentIds.add(event.id);
          controller.enqueue(encodeEvent({ type: "scan-event", event: serializeScanEvent(event) }));
        }
      };

      const scanInterval = setInterval(() => {
        sendRecentEvents().catch(() => close());
      }, 1500);

      const heartbeatInterval = setInterval(() => {
        if (closed) return;
        const message = heartbeatMessages[heartbeatIndex % heartbeatMessages.length];
        heartbeatIndex += 1;
        controller.enqueue(encodeEvent({ type: "heartbeat", message, elapsedMs: Date.now() - startedAt }));
      }, 5000);

      request.signal.addEventListener("abort", close);
      await sendRecentEvents();
      controller.enqueue(encodeEvent({ type: "heartbeat", message: "Live scan console connected", elapsedMs: 0 }));
    }
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no"
    }
  });
}
