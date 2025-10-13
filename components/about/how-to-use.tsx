export function HowToUse() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-bold">How to Use This Platform</h1>
      <p className="mb-4">
        This platform allows you to <b>customize AI responses</b> by adding your
        own <b>instructions</b>. These instructions help shape how the chatbot
        interacts with you and others.
      </p>

      <h2 className="mb-2 text-lg font-semibold">Adding Instructions</h2>
      <p className="mb-4">
        To personalize your chatbot&#39;s responses, go to <b>Settings</b> →{" "}
        <b>Instructions</b>. Here, you can view all your existing instructions
        and add new ones.
      </p>

      <h2 className="mb-2 text-lg font-semibold">How Instructions Work</h2>
      <p className="mb-2">Each instruction has two parts:</p>
      <ul className="mb-4 list-disc space-y-1 pl-6">
        <li>
          <b>Type:</b> This defines what kind of information you&#39;re adding.
          For example:
          <ul className="mt-1 list-disc space-y-1 pl-6">
            <li>
              <i>&#34;How I introduce myself&#34;</i>
            </li>
            <li>
              <i>&#34;What I like to talk about&#34;</i>
            </li>
            <li>
              <i>&#34;My interests and hobbies&#34;</i>
            </li>
            <li>
              <i>&#34;A little about my background&#34;</i>
            </li>
            <li>
              <i>&#34;How I usually respond&#34;</i>
            </li>
          </ul>
        </li>
        <li>
          <b>Content:</b> This is where you write details related to the type.
          Keep it clear and relevant.
        </li>
      </ul>
      <p className="mb-4">
        <b>Note:</b> Avoid adding any <b>sensitive</b> or <b>inappropriate</b>{" "}
        content. Share only what you&#39;re comfortable with.
      </p>

      <h2 className="mb-2 text-lg font-semibold">Setting Your First Message</h2>
      <p className="mb-4">
        You can customize your chatbot&#39;s first message by going to{" "}
        <b>Settings</b> → <b>Profile</b> and editing the <b>First Message</b>{" "}
        field. This message is what others see when they start a chat with your
        AI. Keep it <b>clear and respectful</b> to set the right tone.
      </p>
    </div>
  )
}
