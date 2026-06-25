import type { Config } from "drizzle-kit";

export default {
  schema: "./src/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    // Set DATABASE_URL in .env.local
    // Format: postgresql://postgres.[project-ref]:[password]@aws-east-1.pooler.supabase.com:6543/postgres
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
