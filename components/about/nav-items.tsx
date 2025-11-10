"use client"

import { ListNavItems } from "@/components/co"
import {
  BookOpenTextIcon,
  CircleHelpIcon,
  FileTextIcon,
  ShieldCheckIcon,
} from "lucide-react"

export const aboutItems = [
  {
    title: "How to Use",
    url: "/about/how-to-use",
    Icon: CircleHelpIcon,
  },
  {
    title: "Information",
    url: "/about/information",
    Icon: BookOpenTextIcon,
  },
  {
    title: "Terms of Use",
    url: "/about/terms-of-use",
    Icon: FileTextIcon,
  },
  {
    title: "Privacy Policy",
    url: "/about/privacy-policy",
    Icon: ShieldCheckIcon,
  },
]

export function AboutNavItems() {
  return <ListNavItems items={aboutItems} className="h-10" />
}
