import "./globals.css"
import { Metadata, Viewport } from "next"
import { Fira_Code } from "next/font/google"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { getServerSession, Session } from "next-auth"
import SessionProviderComponent from "@/components/session-provider"
// import NotificationSetup from "@/components/notification-setup"
import { SessionUserProvider } from "@/hooks/use-session-user"
import { getContextUser } from "./actions/session-user"
import { Toaster } from "@/components/ui/sonner"

const fira = Fira_Code({ subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.METADATA_BASE_URL!),
  title: {
    default: "Parx AI chatbot",
    template: "%s / Parx AI chatbot",
  },
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
    images: [{ url: "/opengraph-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Parx AI chatbot",
    description:
      "Customize your own AI with personal instructions that match your style. Chat, adapt, and share your unique AI with friends — simple, smart, and social.",
    images: ["/opengraph-image.png"],
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
  return (
    <html lang="en">
      <head>
        <script src="https://unpkg.com/react-scan/dist/auto.global.js" />
      </head>
      <body className={fira.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
