import type { UIMessage } from "ai"

export type AgentStreamOptions = {
  messages: UIMessage[]
  chatId?: string
  user?: { name: string; avatar?: string }
  onChunk?: (event: { chunk: { type: string; text?: string } }) => void
  onEnd?: (event: {
    finishReason: string
    usage: { inputTokens?: number; outputTokens?: number }
  }) => void
  onStatus?: (status: string) => void
  maxSteps?: number
}

export type InstructionListItem = {
  _id: string
  type: string
  content: string
}
