import { describe, expect, it } from "vitest";
import { latestScanEventTimestamp, mergeScanEvents, serializeScanEvent } from "@/lib/scan-events";

describe("scan event utilities", () => {
  it("serializes persisted scan events for live APIs", () => {
    const serialized = serializeScanEvent({
      id: "event_1",
      level: "INFO",
      message: "Dispatching Gemini batch analysis.",
      artifactId: null,
      createdAt: new Date("2026-05-31T10:15:30.000Z")
    });

    expect(serialized).toEqual({
      id: "event_1",
      level: "INFO",
      message: "Dispatching Gemini batch analysis.",
      artifactId: null,
      createdAt: "2026-05-31T10:15:30.000Z"
    });
  });

  it("deduplicates and sorts scan events", () => {
    const merged = mergeScanEvents(
      [
        { id: "b", level: "SUCCESS", message: "Done", artifactId: null, createdAt: "2026-05-31T10:00:02.000Z" },
        { id: "a", level: "INFO", message: "Start", artifactId: null, createdAt: "2026-05-31T10:00:01.000Z" }
      ],
      [
        { id: "b", level: "SUCCESS", message: "Done again", artifactId: null, createdAt: "2026-05-31T10:00:02.000Z" },
        { id: "c", level: "INFO", message: "Heartbeat", artifactId: "artifact_1", createdAt: "2026-05-31T10:00:03.000Z" }
      ]
    );

    expect(merged.map((event) => event.id)).toEqual(["a", "b", "c"]);
    expect(merged[1].message).toBe("Done again");
    expect(latestScanEventTimestamp(merged)).toBe("2026-05-31T10:00:03.000Z");
  });
});
