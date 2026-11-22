import "./globals.css"
import { Metadata, Viewport } from "next"
import { Geist_Mono, Open_Sans } from "next/font/google"
import { ThemeProvider } from "@/components/ui/theme-provider"
import { Toaster } from "@/components/ui/sonner"

const openSans = Open_Sans({ subsets: ["latin"] })
const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
})

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${openSans.className} ${geistMono.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
