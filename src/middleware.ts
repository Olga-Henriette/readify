import { NextResponse, type NextRequest } from "next/server";

export default async function middleware(request: NextRequest) {
    const sessionCookie = 
        request.cookies.get("better-auth.session_token") || 
        request.cookies.get("__secure-better-auth.session_token");

    const isAuthPage = request.nextUrl.pathname.startsWith("/login") || 
                       request.nextUrl.pathname.startsWith("/register");
    const isDashboardPage = request.nextUrl.pathname.startsWith("/dashboard");

    // 1. Protection : Si non connecté et tente d'accéder au dashboard
    if (!sessionCookie && isDashboardPage) {
        return NextResponse.redirect(new URL("/login", request.url));
    }

    // 2. Redirection : Si déjà connecté et tente d'aller sur login/register
    if (sessionCookie && isAuthPage) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/dashboard/:path*", "/login", "/register"],
};