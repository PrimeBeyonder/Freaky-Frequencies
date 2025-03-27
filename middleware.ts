import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"

export async function middleware(request: NextRequest) {
  // Get the pathname
  const path = request.nextUrl.pathname

  // Public paths that don't require authentication
  const isPublicPath =
    path === "/" || path.startsWith("/auth/") || path.startsWith("/_next/") || path.startsWith("/api/auth/")

  // Get the token from the cookies
  const token = request.cookies.get("blog-auth-token")?.value

  // If the path is not public and there's no token, redirect to login
  if (!isPublicPath && !token) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // If the path is a username path, verify the token
  if (path.match(/^\/[^/]+\//) && token) {
    const payload = await verifyToken(token)

    // If token is invalid, redirect to login
    if (!payload) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    // Extract username from path
    const pathUsername = path.split("/")[1]

    // If trying to access another user's path, redirect to their own home
    if (payload.username !== pathUsername) {
      return NextResponse.redirect(new URL(`/${payload.username}/home`, request.url))
    }
  }

  // If the path is a public auth path and user is already authenticated, redirect to home
  if (path.startsWith("/auth/") && token) {
    const payload = await verifyToken(token)

    if (payload) {
      return NextResponse.redirect(new URL(`/${payload.username}/home`, request.url))
    }
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    /*
     * Match all paths except for:
     * 1. /api routes that don't start with /api/auth
     * 2. /_next (static files)
     * 3. /favicon.ico, /robots.txt, etc.
     */
    "/((?!api/(?!auth)|_next/|favicon.ico|robots.txt).*)",
  ],
}

