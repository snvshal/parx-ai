import "./globals.css"
import { Metadata, Viewport } from "next"
import { Fira_Code } from "next/font/google"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { getServerSession, Session } from "next-auth"
import SessionProviderComponent from "@/components/session-provider"
import { Toaster } from "@/components/ui/toaster"
import NotificationSetup from "@/components/notification-setup"
import { UserProvider } from "@/hooks/use-user"

const fira = Fira_Code({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.METADATA_BASE_URL!),
  title: "Parx AI chatbot",
  description:
    "Customize your own AI with personal instructions that match your style. Chat, adapt, and share your unique AI with friends — simple, smart, and social.",
  icons: [
    { rel: "apple-touch-icon", url: "/icons/icon-192x192.png" },
    { rel: "icon", url: "/icons/icon-192x192.png" },
  ],
  openGraph: {
    title: "Parx AI chatbot",
    description:
      "Customize your own AI with personal instructions that match your style. Chat, adapt, and share your unique AI with friends — simple, smart, and social.",
    images: [{ url: "/icons/icon-192x192.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Parx AI chatbot",
    description:
      "Customize your own AI with personal instructions that match your style. Chat, adapt, and share your unique AI with friends — simple, smart, and social.",
    images: ["/icons/icon-192x192.png"],
    creator: "@snvshal",
  },
}

export const viewport: Viewport = {
  themeColor: "#ffffff",
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
            <UserProvider>
              {children}
              <NotificationSetup />
            </UserProvider>
            <Toaster />
          </ThemeProvider>
        </SessionProviderComponent>
      </body>
    </html>
  )
}
