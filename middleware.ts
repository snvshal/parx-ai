import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(req: NextRequest) {
  const token = await getToken({ req })
  const pathname = req.nextUrl.pathname

  // Route types
  const authRoutes = ["/sign-in"]
  const publicRoutes = ["/m/:username*", "/about*", "/api/chat"]

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(`/m/${token ? token.username : "snvshal"}`, req.url)
    )
  }

  // Check if the current path matches any public route
  const isPublicRoute = publicRoutes.some((route) => {
    const pattern = route.replace(/:\w+\*/g, ".*").replace(/:\w+/g, "[^/]+")
    const regex = new RegExp(`^${pattern}$`)

    return regex.test(pathname)
  })

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  // Return next for API auth routes
  if (pathname.startsWith("/api/auth")) return NextResponse.next()

  // Redirect unauthenticated users trying to access protected routes
  if (!token && !isPublicRoute && !isAuthRoute) {
    const redirectUrl = new URL(
      `/sign-in?callbackUrl=${encodeURIComponent(pathname)}`,
      req.url
    )
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth routes
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
}
