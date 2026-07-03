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

import { ImageDialog } from "../settings/instruction"

export const MemoChatMessage = memo(function ChatMessage({
  message,
}: {
  message: UIMessage
}) {
  const isAssistant = message.role === "assistant"

  const [selectedImage, setSelectedImage] = useState<{
    url: string
    alt: string
  } | null>(null)
  const getTextOnly = (text: string) =>
    text.replace(/!\[.*?\]\(.*?\)/g, "").trim()

  const renderParts = () =>
    message.parts.map((part, i) => {
      if (part.type === "text") {
        return (
          <ReactMarkdown
            key={i}
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeHighlight, rehypeRaw]}
            components={{
              pre: CodeBlock,
              code: ({ children, ...props }) => (
                <span
                  className="bg-foreground/10 rounded px-1 py-0.5 text-sm"
                  {...props}
                >
                  {children}
                </span>
              ),
              img: (props) => (
                <span className="border-border/40 bg-muted/20 my-2.5 block max-w-fit overflow-hidden rounded-xl border shadow-sm transition-all duration-300 hover:scale-[1.01] hover:shadow-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={props.src as string}
                    alt={props.alt || "Image"}
                    className="max-h-65 w-auto max-w-full cursor-pointer object-contain sm:max-h-80"
                    onClick={() =>
                      setSelectedImage({
                        url: props.src as string,
                        alt: getTextOnly(part.text),
                      })
                    }
                  />
                </span>
              ),
              video: (props) => (
                <video
                  {...props}
                  controls
                  className="my-2 max-w-full rounded-lg"
                />
              ),
              iframe: (props) => (
                <div className="my-2 aspect-video w-full max-w-full overflow-hidden rounded-lg">
                  <iframe
                    {...props}
                    className="h-full w-full"
                    allowFullScreen
                  />
                </div>
              ),
              a: ({ href, children, ...props }) => (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all text-blue-500 hover:underline"
                  {...props}
                >
                  {children}
                </a>
              ),
              ol: ({ children }) => (
                <ol className="m-0 list-outside list-decimal pl-4 [&_p]:my-0">
                  {children}
                </ol>
              ),
              ul: ({ children }) => (
                <ul className="m-0 list-outside list-disc pl-4 [&_p]:my-0">
                  {children}
                </ul>
              ),
              li: ({ children }) => (
                <li className="m-0 leading-relaxed [&_p]:my-0">{children}</li>
              ),
            }}
          >
            {part.text}
          </ReactMarkdown>
        )
      }
      return null
    })

  return (
    <div
      className={cn(
        "group animate-in fade-in flex w-full items-start gap-3 duration-200",
        isAssistant ? "flex-row" : "flex-row-reverse",
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-col",
          isAssistant ? "items-start" : "items-end",
        )}
      >
        <div
          className={cn(
            "max-w-[75%] px-4 py-2.5 text-sm leading-relaxed tracking-normal wrap-break-word",
            isAssistant
              ? "border-border/50 bg-card text-card-foreground rounded-2xl rounded-bl-md border shadow-sm"
              : "rounded-2xl rounded-br-md bg-blue-600 text-white shadow-sm dark:bg-blue-500",
          )}
        >
          {isAssistant ? (
            <div className="whitespace-pre-wrap">{renderParts()}</div>
          ) : (
            <p className="overflow-hidden">
              {message.parts
                .filter((p) => p.type === "text")
                .map((p) => p.text)
                .join("")}
            </p>
          )}
        </div>
        <span className="text-muted-foreground mt-1 px-1 text-[10px]">
          {format(
            (message.metadata as { createdAt?: Date })?.createdAt ?? new Date(),
            "h:mm a",
          )}
        </span>
      </div>
      <ImageDialog
        selectedImage={selectedImage}
        setSelectedImage={setSelectedImage}
      />
    </div>
  )
})

const CodeBlock: Components["pre"] = ({ children, ...props }) => {
  const codeRef = useRef<HTMLPreElement | null>(null)
  const [copied, setCopied] = useState(false)
  const codeElement = React.Children.toArray(children)[0] as React.ReactElement
  const language =
    (
      codeElement.props as { node?: { properties?: { className?: string[] } } }
    ).node?.properties?.className?.[1]?.replace("language-", "") ||
    ("text" as string)

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
            <CheckIcon className="h-3 w-3 text-green-500" />
          ) : (
            <CopyIcon className="h-3 w-3 text-white/70" />
          )}
        </button>
      </div>
      <pre
        ref={codeRef}
        className="m-0 overflow-x-auto p-4 text-sm whitespace-pre-wrap"
        {...props}
      >
        {(codeElement.props as { children?: React.ReactNode }).children}
      </pre>
    </div>
  )
}
