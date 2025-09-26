import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: [
    "./src/lib/db/schema.ts",
    "./src/lib/db/schema-boards.ts",
    "./src/lib/db/schema-swimlanes.ts",
    "./src/lib/db/schema-filters.ts",
    "./src/lib/db/schema-permissions.ts",
    "./src/lib/db/schema-analytics.ts"
  ],
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgresql://neondb_owner:npg_Jw9lEFOT5rGf@ep-falling-term-aeli30gd-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require",
  },
  verbose: true,
  strict: true,
});
