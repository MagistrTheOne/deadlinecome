import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Публичные роуты
  const publicRoutes = ["/", "/sign-in", "/sign-up", "/demo"];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));

  // Если это публичный роут, разрешаем доступ
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Проверяем сессию только для защищенных роутов
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Если пользователь не авторизован, перенаправляем на страницу входа
    if (!session) {
      const signInUrl = new URL("/sign-in", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }
  } catch (error) {
    // В случае ошибки, перенаправляем на страницу входа
    const signInUrl = new URL("/sign-in", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Если пользователь авторизован, разрешаем доступ
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
