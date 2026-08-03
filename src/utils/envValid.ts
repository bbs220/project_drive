import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  // NOTE: dont use logger here or its gonna crash due to circular dependency between logger and envValidated
  // Use console.error instead
  console.error("❌ Invalid or missing environment variables:");

  console.error(z.treeifyError(parsedEnv.error));

  process.exit(1);
}

export const envValid = parsedEnv.data;
