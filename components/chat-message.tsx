"use client"

import React, { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { Check, Copy } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import { Message } from "ai"
import type { Components } from "react-markdown"

export function ChatMessage({ message }: { message: Message }) {
  const isAssistant = message.role === "assistant"

  const formatTime = (timestamp?: Date) => {
    if (!timestamp) return ""
    const date = new Date(timestamp)
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
  }

  return (
    <div
      className={cn(
        "group flex w-full items-end gap-2",
        !isAssistant && "flex-row-reverse"
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-2 max-w-[80%]",
          isAssistant && "items-end"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm",
            isAssistant ? "bg-accent" : "bg-blue-700 text-white"
          )}
        >
          {isAssistant ? (
            <div className="prose prose-sm dark:prose-invert max-w-none marker:text-primary-foreground">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  pre: CodeBlock as Components["pre"],
                  code: InlineCode,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <p className="leading-relaxed">{message.content}</p>
          )}
          <div className="text-[10px] text-white/50 text-right">
            {formatTime(message.createdAt as Date)}
          </div>
        </div>
      </div>
    </div>
  )
}

const CodeBlock: Components["pre"] = ({ children, ...props }) => {
  const codeRef = useRef<HTMLPreElement | null>(null)
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
    <div className="relative my-2 w-full max-w-full overflow-hidden rounded-lg bg-black/90">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="text-xs font-medium text-white/70">{language}</span>
        <button
          onClick={handleCopy}
          className="ml-auto flex h-6 w-6 items-center justify-center rounded-md hover:bg-white/10"
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3 text-white/70" />
          )}
        </button>
      </div>
      <div className="overflow-x-auto max-w-full">
        <pre
          ref={codeRef}
          className="overflow-x-auto m-0 p-4 text-sm text-white/90 whitespace-pre-wrap break-words"
          {...props}
        >
          <code className="block max-w-full overflow-x-auto">
            {codeElement.props.children}
          </code>
        </pre>
      </div>
    </div>
  )
}

function InlineCode({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <span
      className={cn("rounded bg-foreground/10 px-1 py-0.5 text-sm", className)}
      {...props}
    >
      {children}
    </span>
  )
}

export default ChatMessage
