"use client"

import Link from "next/link"
import { CopyrightIcon } from "lucide-react"
import Image from "next/image"

export default function FooterComponent() {
  const x = "https://twitter.com/snvshal"
  return (
    <footer className="mt-20 w-full border-t">
      <div className="flex w-full items-center justify-between py-4">
        <p className="flex items-center justify-center gap-2 py-4">
          <CopyrightIcon size={16} />
          <span>
            {new Date().getFullYear()} Parx AI
            <span className="max-sm:hidden">. All rights reserved.</span>
          </span>
        </p>
        <Link
          href={x}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:bg-accent flex h-6 w-6 items-center justify-center rounded transition"
        >
          <Image
            src="/x-logo-white.png"
            width={16}
            height={16}
            alt="X handle"
            className="hidden dark:block"
            priority
          />
          <Image
            src="/x-logo-black.png"
            width={16}
            height={16}
            alt="X handle"
            className="block dark:hidden"
            priority
          />
        </Link>
      </div>
    </footer>
  )
}
