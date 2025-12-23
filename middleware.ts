import { type NextRequest, NextResponse } from "next/server"


export const runtime = "experimental-edge"

export function middleware(request: NextRequest) {
  const username = request.cookies.get("username")?.value

  // If not authenticated and trying to access protected route, redirect to signup
  if (
    !username &&
    !request.nextUrl.pathname.startsWith("/login") &&
    !request.nextUrl.pathname.startsWith("/signup") &&
    !request.nextUrl.pathname.startsWith("/api/auth")
  ) {
    return NextResponse.redirect(new URL("/signup", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

