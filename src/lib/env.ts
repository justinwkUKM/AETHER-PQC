import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1).default("postgresql://aether:aether@localhost:5432/aether_pqc"),
  AUTH_SECRET: z.string().min(1).default("dev-secret-change-me"),
  AUTH_GOOGLE_ID: z.string().optional(),
  AUTH_GOOGLE_SECRET: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-3.5-flash"),
  STORAGE_DRIVER: z.enum(["local", "gcs"]).default("local"),
  LOCAL_STORAGE_DIR: z.string().default("storage/uploads"),
  GCS_BUCKET_NAME: z.string().optional(),
  MAX_UPLOAD_BYTES: z.coerce.number().default(25 * 1024 * 1024),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:3000"),
  TEST_AUTH_ENABLED: z.coerce.boolean().default(false)
});

export const env = envSchema.parse(process.env);
