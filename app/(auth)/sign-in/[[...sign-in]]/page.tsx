"use client"

import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { useRouter, useSearchParams } from "next/navigation"
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
  const router = useRouter()

  const handleSignIn = async () => {
    await signIn("google", { callbackUrl })
    router.replace(callbackUrl)
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md rounded-3xl p-8">
        <CardHeader className="flex flex-col items-center space-y-1 p-0">
          <CardTitle className="flex items-center justify-center mb-1 gap-4">
            SN AI
          </CardTitle>
          <CardDescription className="text-center">
            Customize AI with Your Own Instructions
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-6 space-y-4 p-0">
          <div className="flex items-center justify-center w-full space-y-4">
            <Button
              variant="outline"
              onClick={handleSignIn}
              className="flex items-center justify-center gap-2 rounded-full px-4 py-5"
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
          <div className="text-center text-sm text-muted-foreground">
            By continuing, you agree to StatsDaily&#39;s{" "}
            <Link
              href="/about/terms-of-use"
              className="font-semibold hover:underline"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/about/privacy-policy"
              className="font-semibold hover:underline"
            >
              Privacy Policy
            </Link>
            .
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
