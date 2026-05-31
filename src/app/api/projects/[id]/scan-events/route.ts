import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { serializeScanEvent } from "@/lib/scan-events";
import { getApiProject, getApiUser } from "@/server/auth/api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getApiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const project = await getApiProject(user.id, id);
  if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const after = request.nextUrl.searchParams.get("after");
  let afterDate: Date | undefined;

  if (after) {
    const parsed = new Date(after);
    if (!Number.isNaN(parsed.getTime())) {
      afterDate = parsed;
    } else {
      const cursor = await prisma.scanEvent.findFirst({
        where: { id: after, projectId: id },
        select: { createdAt: true }
      });
      afterDate = cursor?.createdAt;
    }
  }

  const events = await prisma.scanEvent.findMany({
    where: {
      projectId: id,
      ...(afterDate ? { createdAt: { gt: afterDate } } : {})
    },
    orderBy: { createdAt: "asc" },
    take: 80
  });

  return NextResponse.json({ events: events.map(serializeScanEvent) });
}
