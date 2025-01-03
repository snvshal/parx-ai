"use client"

import { cn } from "@/lib/utils"
import { Bot, User, Check, Copy } from "lucide-react"
import React, { useRef, useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import { Message } from "ai"

export function ChatMessage({ message }: { message: Message }) {
  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 rounded-lg p-4",
        message.role === "assistant" ? "bg-background" : "bg-primary-foreground"
      )}
    >
      <div className="rounded-full bg-primary p-2">
        {message.role === "assistant" ? (
          <Bot className="h-4 w-4 text-primary-foreground" />
        ) : (
          <User className="h-4 w-4 text-primary-foreground" />
        )}
      </div>
      <div className="w-1 flex-1 space-y-2">
        {message.role === "assistant" ? (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
              components={{
                pre: ({
                  children,
                  className,
                  ...props
                }: React.ComponentProps<"pre">) => (
                  <CodeBlock {...props}>{children}</CodeBlock>
                ),
                code: InlineCode,
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p>{message.content}</p>
          </div>
        )}
      </div>
    </div>
  )
}

// CodeBlock component for handling `pre` tag content with copy functionality
function CodeBlock({ children, ...props }: { children: React.ReactNode }) {
  const codeRef = useRef<HTMLElement | null>(null)
  const [copied, setCopied] = useState(false)

  const codeElement = React.Children.toArray(children)[0] as React.ReactElement
  const language =
    codeElement.props.node?.properties?.className?.[1]?.replace(
      "language-",
      ""
    ) || "text"

  const handleCopy = () => {
    if (codeRef.current) {
      navigator.clipboard.writeText(codeRef.current.innerText).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  return (
    <div className="relative group w-full max-w-full overflow-hidden rounded-lg border border-gray-700">
      <div className="w-full flex justify-between items-center bg-background/20 h-10 relative">
        <div className="px-2 text-xs text-muted-foreground">{language}</div>
        <button onClick={handleCopy} className="absolute right-2 top-2 p-1">
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
      </div>
      <pre
        className="w-full overflow-x-auto bg-black text-white m-0"
        {...props}
      >
        <code ref={codeRef} className="text-sm">
          {codeElement.props.children}
        </code>
      </pre>
    </div>
  )
}

// InlineCode component for inline `code` styling
function InlineCode({
  inline,
  className,
  ...props
}: {
  inline?: boolean
  className?: string
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn(
        "bg-muted px-1 py-0.5 rounded text-sm",
        !inline && "inline-block"
      )}
      {...props}
    />
  )
}
