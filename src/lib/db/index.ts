import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

// Конфигурация для Neon PostgreSQL
const client = postgres(process.env.DATABASE_URL!, {
  ssl: 'require',
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
});

export const db = drizzle(client);
