import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { HeaderComponent } from "@/components/header"

export default async function ChatbotInfoPage({
  params,
}: {
  params: Promise<{ username: string }>
}) {
  const username = (await params).username
  return (
    <HeaderComponent page="What is it?">
      <div className="max-w-2xl mx-auto py-2 space-y-6">
        <h1 className="text-2xl font-bold">What is this chatbot?</h1>
        <Card>
          <CardContent className="p-4 space-y-4">
            <p>
              This chatbot is customized based on @{username}&#39;s defined
              instructions. Its responses are influenced by system prompts and
              preferences set by @{username}.
            </p>
            <h2 className="text-lg font-semibold">How does it work?</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>
                Custom instructions set by @{username} define response behavior.
              </li>
              <li>
                The chatbot&#39;s tone, knowledge, and preferences are adjusted
                based on these instructions.
              </li>
              <li>
                AI responses are generated using a combination of predefined
                logic and model capabilities.
              </li>
            </ul>
            <h2 className="text-lg font-semibold">
              Can I make my own chatbot?
            </h2>
            <p>
              Yes! You can personalize your own chatbot by defining how it
              should respond, what knowledge it should focus on, and its
              preferred style of interaction.
            </p>
            <div className="flex justify-end gap-2">
              <Link href="/settings">
                <Button>Create Your Own</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </HeaderComponent>
  )
}
