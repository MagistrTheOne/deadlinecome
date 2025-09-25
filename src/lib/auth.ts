import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import * as schema from "@/lib/db/schema";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg", // PostgreSQL
    schema: schema,
  }),

  // Email & Password Authentication
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // Auto sign-in after signup
  },

  // Social Providers (optional)
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },

  // Улучшенное управление сессиями
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 дней
    updateAge: 60 * 60 * 24, // Обновлять каждые 24 часа
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 24 * 7, // 7 дней в кеше
    },
  },

  // Дополнительные настройки безопасности
  advanced: {
    generateId: () => crypto.randomUUID(),
    crossSubDomainCookies: {
      enabled: false,
    },
    useSecureCookies: process.env.NODE_ENV === "production",
    trustedOrigins: process.env.NODE_ENV === "production" 
      ? [process.env.NEXTAUTH_URL || "https://deadline.app"] 
      : ["http://localhost:3000"],
  },

  // Автоматическое продление сессии
  plugins: [
    {
      id: "session-refresh",
      onRequest: async (ctx) => {
        // Автоматически продлеваем сессию при активности
        if ((ctx as any).session && (ctx as any).request?.url?.includes('/api/')) {
          const lastActivity = ((ctx as any).session as any).lastActivity || 0;
          const now = Date.now();
          
          // Если прошло больше 1 часа с последней активности, обновляем сессию
          if (now - lastActivity > 60 * 60 * 1000) {
            await ((ctx as any).session as any).update({
              lastActivity: now,
            });
          }
        }
      },
    },
  ],
});
