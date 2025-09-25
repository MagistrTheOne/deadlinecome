import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000"
});

// Экспортируем отдельные методы для удобства
export const { signIn, signUp, signOut, useSession } = authClient;
