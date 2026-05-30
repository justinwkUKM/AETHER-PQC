"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireUser } from "@/server/auth/guards";

export async function createProject(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!name) throw new Error("Project name is required.");

  const project = await prisma.project.create({
    data: {
      name,
      description: description || null,
      userId: user.id,
      scanEvents: {
        create: {
          level: "SUCCESS",
          message: `Project ${name} initialized.`
        }
      }
    }
  });

  revalidatePath("/dashboard");
  redirect(`/project/${project.id}/scan`);
}

export async function deleteProject(projectId: string) {
  const user = await requireUser();
  await prisma.project.deleteMany({ where: { id: projectId, userId: user.id } });
  revalidatePath("/dashboard");
  redirect("/dashboard");
}
