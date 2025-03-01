import "./globals.css"
import { Metadata, Viewport } from "next"
import { Fira_Code } from "next/font/google"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { getServerSession, Session } from "next-auth"
import SessionProviderComponent from "@/components/session-provider"
import { Toaster } from "@/components/ui/toaster"

const fira = Fira_Code({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.METADATA_BASE_URL!),
  title: "VSHAL chatbot",
  description: "A simple VSHAL chatbot using Next.js and Gemini",
  icons: [
    { rel: "apple-touch-icon", url: "/icons/icon-192x192.png" },
    { rel: "icon", url: "/icons/icon-192x192.png" },
  ],
  openGraph: {
    title: "VSHAL chatbot",
    description: "A simple VSHAL chatbot using Next.js and Gemini",
    images: [{ url: "/icons/icon-192x192.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "VSHAL chatbot",
    description: "A simple VSHAL chatbot using Next.js and Gemini",
    images: ["/icons/icon-192x192.png"],
    creator: "@snvshal",
  },
}

export const viewport: Viewport = {
  themeColor: "#242427",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session: Session | null = await getServerSession()

  return (
    <html lang="en">
      <body className={fira.className}>
        <SessionProviderComponent session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster />
          </ThemeProvider>
        </SessionProviderComponent>
      </body>
    </html>
  )
}
