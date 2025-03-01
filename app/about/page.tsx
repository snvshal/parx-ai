"use client"

import { HeaderComponent } from "@/components/header"
import { ActionItems, ActionItemsProps } from "../settings/components"
import {
  BookOpenTextIcon,
  CircleHelpIcon,
  FileTextIcon,
  ShieldCheckIcon,
} from "lucide-react"

export default function AboutPage() {
  const aboutItems: ActionItemsProps[] = [
    {
      role: "url",
      Icon: CircleHelpIcon,
      url: "/about/how-to-use",
      name: "How to Use?",
    },
    {
      role: "url",
      Icon: BookOpenTextIcon,
      url: "/about/information",
      name: "Information",
    },
    {
      role: "url",
      Icon: FileTextIcon,
      url: "/about/terms-of-use",
      name: "Terms of Use",
    },
    {
      role: "url",
      Icon: ShieldCheckIcon,
      url: "/about/privacy-policy",
      name: "Privacy Policy",
    },
  ]
  return (
    <HeaderComponent page="About">
      <ActionItems items={aboutItems} />
    </HeaderComponent>
  )
}
