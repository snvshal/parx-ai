import "./globals.css"
import { Metadata, Viewport } from "next"
import { Fira_Code } from "next/font/google"
import { ThemeProvider } from "@/components/ui/theme-provider"

const fira = Fira_Code({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI Chatbot",
  description: "A simple AI chatbot using Next.js and Gemini",
  icons: [
    { rel: "apple-touch-icon", url: "/icons/icon-192x192.png" },
    { rel: "icon", url: "/icons/icon-192x192.png" },
  ],
  openGraph: {
    title: "AI Chatbot",
    description: "A simple AI chatbot using Next.js and Gemini",
    images: [{ url: "/icons/icon-192x192.png" }],
  },
}

export const viewport: Viewport = {
  themeColor: "#242427",
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={fira.className}>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  )
}
