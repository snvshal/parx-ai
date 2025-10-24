"use client"

import React, { memo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { CheckIcon, CopyIcon } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeHighlight from "rehype-highlight"
import "highlight.js/styles/github-dark.css"
import type { UIMessage } from "ai"
import type { Components } from "react-markdown"
import { format } from "date-fns"
import { Tweet } from "react-tweet"

export const MemoChatMessage = memo(function ChatMessage({
  message,
}: {
  message: UIMessage
}) {
  const isAssistant = message.role === "assistant"

  return (
    <div
      className={cn(
        "group my-4 flex w-full items-start gap-2",
        !isAssistant && "flex-row-reverse",
      )}
    >
      <div
        className={cn(
          "flex min-w-0 max-w-[80%] flex-col gap-2",
          isAssistant && "items-end",
        )}
      >
        <div
          className={cn(
            "w-full break-words rounded-2xl px-4 py-2 text-sm",
            isAssistant
              ? "bg-accent"
              : "bg-blue-700 text-white dark:bg-blue-800",
          )}
        >
          {/* eslint-disable @next/next/no-img-element */}
          {isAssistant ? (
            <div className="prose prose-sm w-full overflow-hidden break-words dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={{
                  pre: CodeBlock as Components["pre"],
                  code: InlineCode,
                  img: ({ node, ...props }) => (
                    <img
                      {...props}
                      alt="image"
                      className="my-2 h-auto max-h-80 max-w-full rounded-lg"
                    />
                  ),
                  video: ({ node, ...props }) => (
                    <video
                      {...props}
                      controls
                      className="my-2 max-w-full rounded-lg"
                    />
                  ),
                  iframe: ({ node, ...props }) => (
                    <div className="my-2 aspect-video w-full max-w-full overflow-hidden rounded-lg">
                      <iframe
                        {...props}
                        className="h-full w-full"
                        allowFullScreen
                      />
                    </div>
                  ),
                  a: ({ href, children, ...props }) => {
                    if (
                      href?.startsWith("https://x.com/") &&
                      href.includes("/status/") &&
                      href?.includes("x.com")
                    ) {
                      const tweetId = href.split("/status/")[1]?.split("?")[0]
                      return (
                        <div className="my-3">
                          <Tweet id={tweetId} />
                        </div>
                      )
                    }
                    return (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="break-all text-blue-500 hover:underline"
                        {...props}
                      >
                        {children}
                      </a>
                    )
                  },
                  ol: ({ children }) => <ol className="ml-3">{children}</ol>,
                }}
              >
                {message.content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="w-full">
              <p className="overflow-hidden whitespace-pre-wrap break-words leading-relaxed">
                {message.content}
              </p>
            </div>
          )}
          <div
            className={cn(
              "mt-1 text-right text-[10px]",
              isAssistant ? "text-foreground/50" : "text-white/50",
            )}
          >
            {format(message.createdAt as Date, "h:mm a")}
          </div>
        </div>
      </div>
    </div>
  )
})

const CodeBlock: Components["pre"] = ({ children, ...props }) => {
  const codeRef = useRef<HTMLPreElement | null>(null)
  const [copied, setCopied] = useState(false)
  const codeElement = React.Children.toArray(children)[0] as React.ReactElement
  const language =
    codeElement.props.node?.properties?.className?.[1]?.replace(
      "language-",
      "",
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
          className="m-0 whitespace-pre-wrap break-words p-4 text-sm text-white/90"
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
        "break-all rounded bg-foreground/10 px-1 py-0.5 text-sm",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}
