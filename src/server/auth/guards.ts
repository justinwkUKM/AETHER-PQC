import { redirect } from "next/navigation";
import { auth } from "@/server/auth";
import { prisma } from "@/lib/db";

export async function requireUser() {
  if (process.env.TEST_AUTH_ENABLED === "true") {
    return prisma.user.upsert({
      where: { email: "test@aether.local" },
      update: {},
      create: { email: "test@aether.local", name: "AETHER Test Operator" }
    });
  }

  const session = await auth();
  const email = session?.user?.email;

  if (!email) {
    redirect("/login");
  }

  return prisma.user.upsert({
    where: { email },
    update: {
      name: session.user.name,
      image: session.user.image
    },
    create: {
      email,
      name: session.user.name,
      image: session.user.image
    }
  });
}

export async function requireProject(userId: string, projectId: string) {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: {
      artifacts: { orderBy: { createdAt: "desc" } },
      remediations: { orderBy: [{ priority: "asc" }, { createdAt: "desc" }] },
      scanEvents: { orderBy: { createdAt: "desc" }, take: 80 }
    }
  });

  if (!project) {
    throw new Error("Project not found or access denied.");
  }

  return project;
}
