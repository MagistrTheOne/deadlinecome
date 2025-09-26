import { auth } from "@/lib/auth";
import { NextRequest } from "next/server";

/**
 * Проверяет аутентификацию пользователя
 * @param req NextRequest
 * @param role опциональная роль для проверки авторизации
 * @returns объект сессии пользователя
 * @throws Response с 401 если пользователь не авторизован
 * @throws Response с 403 если роль не соответствует
 */
export async function requireAuth(req: NextRequest, role?: 'user' | 'admin') {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      throw new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Проверка роли если указана
    if (role && !hasRole(session.user, role)) {
      throw new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return session;
  } catch (error) {
    // Если уже Response, пробрасываем дальше
    if (error instanceof Response) {
      throw error;
    }

    // Для других ошибок возвращаем 500
    throw new Response(JSON.stringify({ error: "Authentication failed" }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

/**
 * Проверяет имеет ли пользователь указанную роль
 */
function hasRole(user: any, role: string): boolean {
  // Проверяем роли в объекте пользователя
  if (user?.roles && Array.isArray(user.roles)) {
    return user.roles.includes(role);
  }

  // Проверяем прямое поле role
  if (user?.role === role) {
    return true;
  }

  // Для обратной совместимости - все аутентифицированные пользователи имеют роль 'user'
  if (role === 'user') {
    return true;
  }

  return false;
}

/**
 * Безопасный guard для опциональной аутентификации
 * Возвращает сессию если пользователь авторизован, null если нет
 */
export async function getOptionalAuth(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers,
    });
    return session;
  } catch {
    return null;
  }
}
