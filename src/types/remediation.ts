import { z } from "zod";

export const remediationPrioritySchema = z.enum(["CRITICAL", "HIGH", "MEDIUM", "LOW"]);

export const remediationActionSchema = z.object({
  title: z.string().min(1),
  detail: z.string().min(1),
  ownerQuestion: z.string().optional()
});

export const remediationPlanSchema = z.object({
  targetNode: z.string().min(1),
  threatPath: z.string().min(1),
  vulnerablePrimitive: z.string().optional(),
  recommendedMigration: z.string().optional(),
  priority: remediationPrioritySchema,
  actionPlan: z.array(remediationActionSchema).min(1),
  confidence: z.number().min(0).max(1).default(1),
  sourceArtifactIds: z.array(z.string()).default([]),
  residualRiskNotes: z.string().optional()
});

export const remediationPlansSchema = z.object({
  remediations: z.array(remediationPlanSchema)
});

export type RemediationPlan = z.infer<typeof remediationPlanSchema>;
