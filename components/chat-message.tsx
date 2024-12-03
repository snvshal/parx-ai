import { cn } from "@/lib/utils"
import { Bot, User } from "lucide-react"

interface ChatMessageProps {
  message: {
    role: "assistant" | "user"
    content: string
  }
}

export function ChatMessages({ message }: ChatMessageProps) {
  return (
    <div
      className={cn(
        "flex w-full items-start gap-4 rounded-lg p-4",
        message.role === "assistant" ? "bg-muted" : "bg-background"
      )}
    >
      <div className="rounded-full bg-primary p-2">
        {message.role === "assistant" ? (
          <Bot className="h-4 w-4 text-primary-foreground" />
        ) : (
          <User className="h-4 w-4 text-primary-foreground" />
        )}
      </div>
      <div className="flex-1 space-y-2">
        <p className="text-sm font-medium">
          {message.role === "assistant" ? "AI Assistant" : "You"}
        </p>
        <p className="text-sm text-muted-foreground">{message.content}</p>
      </div>
    </div>
  )
}
