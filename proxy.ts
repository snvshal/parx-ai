import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import { Ratelimit } from "@upstash/ratelimit"
import { redis } from "@/lib/redis"

const chatLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "60 s"),
  analytics: true,
  prefix: "ratelimit:chat",
})

export async function proxy(req: NextRequest) {
  const token = await getToken({ req })
  const pathname = req.nextUrl.pathname

  if (pathname === "/api/chat" && !token) {
    const ip =
      req.headers.get("x-forwarded-for") ??
      req.headers.get("x-real-ip") ??
      "anonymous"
    const { success, limit, remaining, reset } = await chatLimiter.limit(ip)

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please slow down." },
        {
          status: 429,
          headers: {
            "X-RateLimit-Limit": limit.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": reset.toString(),
          },
        },
      )
    }
  }

  const authRoutes = ["/sign-in", "/auth/google"]
  const publicRoutes = [
    "/m/:username*",
    "/about",
    "/about/:category*",
    "/api/chat",
    "/people",
  ]

  if (pathname === "/") {
    return NextResponse.redirect(
      new URL(`/m/${token ? token.username : "snvshal"}`, req.url),
    )
  }

  if (pathname === "/about") {
    return NextResponse.redirect(new URL("/about/how-to-use", req.url))
  }

  const isPublicRoute = publicRoutes.some((route) => {
    const pattern = route.replace(/:\w+\*/g, ".*").replace(/:\w+/g, "[^/]+")
    const regex = new RegExp(`^${pattern}$`)
    return regex.test(pathname)
  })

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  if (pathname.startsWith("/api/auth")) return NextResponse.next()

  if (!token && !isPublicRoute && !isAuthRoute) {
    const redirectUrl = new URL(
      `/sign-in?callbackUrl=${encodeURIComponent(pathname)}`,
      req.url,
    )
    return NextResponse.redirect(redirectUrl)
  }

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
