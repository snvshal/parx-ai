import Link from "next/link"

export function HowToUse() {
  return (
    <div className="mx-auto max-w-3xl leading-relaxed tracking-wide">
      <h1 className="text-foreground/95 mb-4 text-2xl font-bold">How to Use</h1>

      <p className="text-foreground/85 mb-6">
        This platform lets you fully customize how the AI responds by adding
        your own instructions. These instructions shape the chatbot’s
        personality, tone, and the way it interacts with you and others.
      </p>

      <h2 className="text-foreground/95 mb-2 text-lg font-semibold">
        Adding Instructions
      </h2>
      <p className="text-foreground/85 mb-6">
        To personalize your chatbot, go to{" "}
        <Link href="/settings/instructions" className="hover:underline">
          <b>Settings → Instructions</b>
        </Link>
        . This is where you can see all of your existing instructions and create
        new ones whenever you like.
      </p>

      <h2 className="text-foreground/95 mb-2 text-lg font-semibold">
        How Instructions Work
      </h2>
      <p className="text-foreground/85 mb-4">
        Every instruction consists of two simple parts: a <b>type</b> and the{" "}
        <b>content</b>.
      </p>
      <p className="text-foreground/85 mb-4">
        The type tells the AI how to prioritize the information. Instructions
        marked as <b>Identity</b>, <b>Core</b>, or <b>Global</b> are always used
        to maintain your chatbot's personality. Other types are retrieved
        dynamically only when they are relevant to the conversation, keeping the
        chat efficient.
      </p>
      <p className="text-foreground/85 mb-6">
        In the content section, write the actual details you want the AI to
        know. Keep it clear and relevant. You’re also welcome to include public
        links to resources such as images, YouTube videos, or X (Twitter)
        posts—the AI can reference them when needed.
      </p>

      <p className="text-foreground/85 mb-6">
        <b>Important:</b>
        <span className="bg-amber-300 px-2 dark:bg-amber-800">
          Please avoid adding sensitive, private, or inappropriate information.
          Only share what you’re comfortable making public.
        </span>
      </p>

      <h2 className="text-foreground/95 mb-2 text-lg font-semibold">
        Setting Your First Message
      </h2>
      <p className="text-foreground/85">
        You can decide exactly what your chatbot says when someone starts a new
        conversation. Just go to{" "}
        <Link href="/settings/profile" className="hover:underline">
          <b>Settings → Profile</b>
        </Link>{" "}
        and edit the <b>First Message</b> field. A friendly, clear, and
        respectful greeting helps set the right tone from the very beginning.
      </p>
    </div>
  )
}
