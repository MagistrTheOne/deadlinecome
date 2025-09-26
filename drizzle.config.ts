import type { Config } from 'drizzle-kit';

export default {
  schema: './src/db/schema/**/*.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  },
  verbose: true,
  strict: true,
  casing: 'snake_case',
  breakpoints: true,
} satisfies Config;
