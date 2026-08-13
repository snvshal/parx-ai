"use client"

import React, { memo, useRef, useState } from "react"
import { cn } from "@/lib/utils"
import { CheckIcon, CopyIcon } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import rehypeHighlight from "rehype-highlight"
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
                  {...props}
                  className="bg-foreground/10 rounded px-1 py-0.5 text-sm"
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
                    loading="lazy"
                    decoding="async"
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
              a: ({ href, children, ...props }) =>
                href && /^(https?:|mailto:)/i.test(href) ? (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    {...props}
                    className="break-all text-blue-500 hover:underline"
                  >
                    {children}
                  </a>
                ) : (
                  <span {...props}>{children}</span>
                ),
              ol: ({ children }) => (
                <ol className="mt-2 list-outside list-decimal pl-4">
                  {children}
                </ol>
              ),
              ul: ({ children }) => (
                <ul className="mt-2 list-outside list-disc pl-4">{children}</ul>
              ),
              table: ({ children }) => (
                <div className="border-border/60 my-2 max-w-full overflow-x-auto rounded-lg border">
                  <table className="w-full border-collapse text-sm">
                    {children}
                  </table>
                </div>
              ),
              caption: (props) => (
                <caption
                  {...props}
                  className="border-border/50 bg-muted/20 text-muted-foreground border-b px-3 py-2 text-left text-xs"
                />
              ),
              th: (props) => (
                <th
                  {...props}
                  className="border-border/60 bg-muted/50 border-b px-3 py-2 text-left font-medium"
                />
              ),
              td: (props) => (
                <td
                  {...props}
                  className="border-border/50 border-b px-3 py-2 align-top"
                />
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-border/60 text-muted-foreground my-2 border-l-4 pl-3">
                  {children}
                </blockquote>
              ),
              hr: () => <hr className="border-border/60 my-3" />,
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
              ? "border-border/50 bg-popover text-card-foreground shadow-surface rounded-2xl rounded-bl-md border"
              : "bg-primary text-primary-foreground rounded-2xl rounded-br-md shadow-sm",
          )}
        >
          {isAssistant ? (
            <div>{renderParts()}</div>
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
  const codeElement = React.Children.toArray(children)[0] as
    | React.ReactElement
    | undefined
  const language =
    (
      codeElement?.props as {
        node?: { properties?: { className?: string[] } }
      }
    )?.node?.properties?.className
      ?.find((c) => c.startsWith("language-"))
      ?.replace("language-", "") ?? "text"

  const handleCopy = () => {
    if (codeRef.current) {
      navigator.clipboard.writeText(codeRef.current.innerText).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  return (
    <div className="code-block border-border/50 relative my-2 w-full max-w-full overflow-hidden rounded-lg border">
      <div className="border-border/60 flex items-center justify-between border-b px-4 py-2">
        <span className="text-muted-foreground text-xs font-medium">
          {language}
        </span>
        <button
          onClick={handleCopy}
          className="text-muted-foreground hover:bg-muted/60 hover:text-foreground ml-auto flex h-6 w-6 items-center justify-center rounded-md"
        >
          {copied ? (
            <CheckIcon className="h-3 w-3 text-green-500" />
          ) : (
            <CopyIcon className="h-3 w-3" />
          )}
        </button>
      </div>
      <pre
        ref={codeRef}
        className="m-0 overflow-x-auto p-4 text-sm whitespace-pre-wrap"
        {...props}
      >
        {(codeElement?.props as { children?: React.ReactNode })?.children}
      </pre>
    </div>
  )
}
