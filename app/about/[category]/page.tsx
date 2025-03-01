import { notFound } from "next/navigation"
import { HowToUse, Information, PrivacyPolicy, TermsOfUse } from "./components"
import { HeaderComponent } from "@/components/header"

export default async function AboutCategory({
  params,
}: {
  params: Promise<{ category: string }>
}) {
  const category = (await params).category

  switch (category) {
    case "how-to-use":
      return (
        <HeaderComponent page="How to Use">
          <HowToUse />
        </HeaderComponent>
      )

    case "information":
      return (
        <HeaderComponent page="Information">
          <Information />
        </HeaderComponent>
      )

    case "privacy-policy":
      return (
        <HeaderComponent page="Privacy Policy">
          <PrivacyPolicy />
        </HeaderComponent>
      )

    case "terms-of-use":
      return (
        <HeaderComponent page="Terms of Use">
          <TermsOfUse />
        </HeaderComponent>
      )

    default:
      return notFound()
  }
}
