import { auth } from "@/server/auth";
import { prisma } from "@/lib/db";

export async function getApiUser() {
  const session = await auth();
  const email = session?.user?.email;

  if (email) {
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

  if (process.env.TEST_AUTH_ENABLED === "true") {
    return prisma.user.upsert({
      where: { email: "test@aether.local" },
      update: {},
      create: { email: "test@aether.local", name: "AETHER Test Operator" }
    });
  }

  return null;
}

export async function getApiProject(userId: string, projectId: string) {
  return prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true }
  });
}
