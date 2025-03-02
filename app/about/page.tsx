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
      role: "link",
      Icon: CircleHelpIcon,
      url: "/about/how-to-use",
      name: "How to Use?",
    },
    {
      role: "link",
      Icon: BookOpenTextIcon,
      url: "/about/information",
      name: "Information",
    },
    {
      role: "link",
      Icon: FileTextIcon,
      url: "/about/terms-of-use",
      name: "Terms of Use",
    },
    {
      role: "link",
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
