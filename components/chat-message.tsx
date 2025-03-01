"use client"

import React, { useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { CheckIcon, CopyIcon } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import type { Message } from "ai"
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
        "group flex w-full items-start gap-2 my-4",
        !isAssistant && "flex-row-reverse"
      )}
    >
      <div
        className={cn(
          "flex flex-col gap-2 max-w-[80%] min-w-0",
          isAssistant && "items-end"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2 text-sm break-words w-full",
            isAssistant
              ? "bg-accent"
              : "dark:bg-blue-800 bg-blue-700 text-white"
          )}
        >
          {/* eslint-disable @next/next/no-img-element */}
          {isAssistant ? (
            <div className="prose prose-sm dark:prose-invert w-full overflow-hidden break-words">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight]}
                components={{
                  pre: CodeBlock as Components["pre"],
                  code: InlineCode,
                  img: ({ node, ...props }) => (
                    <img
                      {...props}
                      alt="image"
                      className="max-w-full h-auto max-h-80 rounded-lg my-2"
                    />
                  ),
                  a: ({ children, target = "_blank", ...props }) => (
                    <a
                      target={target}
                      className="whitespace-pre-wrap break-words overflow-hidden"
                      {...props}
                    >
                      {children}
                    </a>
                  ),
                  ol: ({ children }) => <ol className="ml-3">{children}</ol>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="w-full">
              <p className="leading-relaxed whitespace-pre-wrap break-words overflow-hidden">
                {message.content}
              </p>
            </div>
          )}
          <div
            className={cn(
              "text-[10px] text-right mt-1",
              isAssistant ? "text-foreground/50" : "text-white/50"
            )}
          >
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
    <div className="relative my-2 w-full overflow-hidden rounded-lg bg-black/90">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
        <span className="text-xs font-medium text-white/70">{language}</span>
        <button
          onClick={handleCopy}
          className="ml-auto flex h-6 w-6 items-center justify-center rounded-md hover:bg-white/10"
        >
          {copied ? (
            <CheckIcon className="h-3 w-3 text-green-500" />
          ) : (
            <CopyIcon className="h-3 w-3 text-white/70" />
          )}
        </button>
      </div>
      <div className="overflow-x-auto">
        <pre
          ref={codeRef}
          className="m-0 p-4 text-sm text-white/90 whitespace-pre-wrap break-words"
          {...props}
        >
          <code className="block">{codeElement.props.children}</code>
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
      className={cn(
        "rounded bg-foreground/10 px-1 py-0.5 text-sm break-all",
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default ChatMessage
