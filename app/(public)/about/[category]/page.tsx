import { notFound } from "next/navigation"
import { HeaderComponent } from "@/components/header"
import { HowToUse } from "@/components/about/how-to-use"
import { Information } from "@/components/about/information"
import { PrivacyPolicy } from "@/components/about/privacy-policy"
import { TermsOfUse } from "@/components/about/terms-of-use"
import FooterComponent from "@/components/footer"
import { SidebarTrigger } from "@/components/ui/sidebar"

const CATEGORY_COMPONENTS = {
  "how-to-use": HowToUse,
  information: Information,
  "privacy-policy": PrivacyPolicy,
  "terms-of-use": TermsOfUse,
} as const

export const dynamic = "force-static"

export async function generateStaticParams() {
  return Object.keys(CATEGORY_COMPONENTS).map((category) => ({
    category,
  }))
}

export default async function AboutCategory({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const { category } = await params
  const Component =
    CATEGORY_COMPONENTS[category as keyof typeof CATEGORY_COMPONENTS]

  if (!Component) return notFound()

  return (
    <HeaderComponent
      page="About /"
      actionItem={<SidebarTrigger className="z-50" />}
    >
      <Component />
      <FooterComponent />
    </HeaderComponent>
  )
}
