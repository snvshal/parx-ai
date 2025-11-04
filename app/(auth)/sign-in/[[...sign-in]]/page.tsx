"use client"

import { Button } from "@/components/ui/button"
import { useSearchParams } from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"
import Image from "next/image"

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const handleSignIn = () => {
    const width = 500
    const height = 600
    const left = window.screen.width / 2 - width / 2
    const top = window.screen.height / 2 - height / 2

    const popup = window.open(
      `/api/auth/signin/google?callbackUrl=${encodeURIComponent("/auth/success")}`,
      "googleSignIn",
      `width=${width},height=${height},top=${top},left=${left},menubar=no,toolbar=no,status=no,resizable=yes,scrollbars=yes`,
    )

    if (!popup) return

    const handleMessage = (event: MessageEvent) => {
      if (event.data === "SIGNED_IN") {
        popup.close()
        window.removeEventListener("message", handleMessage)
        window.location.href = callbackUrl
      }
    }

    window.addEventListener("message", handleMessage)
  }

  return (
    <div className="flex h-[100dvh] flex-col items-center justify-center md:flex-row">
      <div className="relative flex h-1/2 w-full items-center justify-center bg-muted/10 max-md:hidden md:h-full md:w-1/2">
        <Image
          src="/login.gif"
          alt="gif"
          fill
          sizes="50vw"
          className="scale-x-[-1] object-cover"
          priority
          unoptimized
        />
      </div>

      <div className="relative flex h-auto w-full items-center justify-center p-8 md:h-full md:w-1/2">
        <Card className="max-w-sm border-0 shadow-none">
          <CardHeader className="flex flex-col items-center space-y-2 p-0">
            <CardTitle className="text-3xl font-semibold">Parx AI</CardTitle>
            <CardDescription className="text-center text-base">
              Customize AI with Your Own Instructions
            </CardDescription>
          </CardHeader>

          <CardContent className="mt-6 space-y-6 p-0">
            <div className="flex w-full justify-center">
              <Button
                variant="outline"
                onClick={handleSignIn}
                className="flex items-center justify-center gap-2 rounded-full px-6 py-5 text-base"
              >
                <Image
                  src="/google.svg"
                  width={24}
                  height={24}
                  alt="google icon"
                />
                <span>Continue with Google</span>
              </Button>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              By continuing, you agree to StatsDaily&#39;s{" "}
              <Link
                href="/about/terms-of-use"
                target="_blank"
                className="font-semibold hover:underline"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="/about/privacy-policy"
                target="_blank"
                className="font-semibold hover:underline"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
