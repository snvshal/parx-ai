import { notFound } from "next/navigation"
import { HeaderComponent } from "@/components/header"
import { HowToUse } from "@/components/about/how-to-use"
import { Information } from "@/components/about/information"
import { PrivacyPolicy } from "@/components/about/privacy-policy"
import { TermsOfUse } from "@/components/about/terms-of-use"
import FooterComponent from "@/components/footer"

export default async function AboutCategory({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const category = (await params).category

  switch (category) {
    case "how-to-use":
      return (
        <HeaderComponent page="About /">
          <HowToUse />
          <FooterComponent />
        </HeaderComponent>
      )

    case "information":
      return (
        <HeaderComponent page="About /">
          <Information />
          <FooterComponent />
        </HeaderComponent>
      )

    case "privacy-policy":
      return (
        <HeaderComponent page="About /">
          <PrivacyPolicy />
          <FooterComponent />
        </HeaderComponent>
      )

    case "terms-of-use":
      return (
        <HeaderComponent page="About /">
          <TermsOfUse />
          <FooterComponent />
        </HeaderComponent>
      )

    default:
      return notFound()
  }
}
