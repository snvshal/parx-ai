export function HowToUse() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">How to Use This Platform</h1>
      <p className="mb-4">
        This platform allows you to <b>customize AI responses</b> by adding your
        own <b>instructions</b>. These instructions help shape how the chatbot
        interacts with you and others.
      </p>

      <h2 className="text-lg font-semibold mb-2">Adding Instructions</h2>
      <p className="mb-4">
        To personalize your chatbot&#39;s responses, go to <b>Settings</b> →{" "}
        <b>Instructions</b>. Here, you can view all your existing instructions
        and add new ones.
      </p>

      <h2 className="text-lg font-semibold mb-2">How Instructions Work</h2>
      <p className="mb-2">Each instruction has two parts:</p>
      <ul className="list-disc pl-6 mb-4 space-y-1">
        <li>
          <b>Type:</b> This defines what kind of information you&#39;re adding.
          For example:
          <ul className="list-disc pl-6 mt-1 space-y-1">
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

      <h2 className="text-lg font-semibold mb-2">Setting Your First Message</h2>
      <p className="mb-4">
        You can customize your chatbot&#39;s first message by going to{" "}
        <b>Settings</b> → <b>Profile</b> and editing the <b>First Message</b>{" "}
        field. This message is what others see when they start a chat with your
        AI. Keep it <b>clear and respectful</b> to set the right tone.
      </p>
    </div>
  )
}

export function Information() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">About This Platform</h1>
      <p className="mb-4">
        This platform allows you to <b>modify AI-generated responses</b> by
        adding <b>Custom Instructions (System Prompts)</b>. With this feature,
        you can personalize how the AI interacts with you, ensuring responses
        align with your preferences.
      </p>
      <p className="mb-4">
        The primary focus is to give you control over{" "}
        <b>what information you want to share</b> when engaging with AI, while
        ensuring a <b>safe and responsible</b> experience. You can{" "}
        <b>create, edit, and manage your instructions</b>, keeping them private
        or choosing to share them in a controlled manner.
      </p>
      <p className="mb-4">
        You can use this platform to <b>create your own AI chatbot</b> by
        providing <b>non-sensitive general information</b> as instructions. The
        AI will use this information to generate responses that reflect your
        chosen personality, knowledge, or expertise, making interactions more
        personalized and engaging.
      </p>
      <p className="mb-4">
        Once your chatbot is set up, you can <b>share it with your friends</b>{" "}
        so they can interact with it and experience the AI responding based on
        your unique instructions.
      </p>
      <p className="mb-4">
        While this platform encourages customization, it is equally important to{" "}
        <b>be cautious about including sensitive or personal information</b>.
        Additionally, any inappropriate content is strictly prohibited to
        maintain a respectful and ethical AI environment.
      </p>
      <p>
        By using this platform, you agree to follow its guidelines and
        contribute to a <b>positive AI-driven experience</b>.
      </p>
    </div>
  )
}

export function TermsOfUse() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Terms of Use</h1>
      <p className="mb-4">
        By using this platform, you agree to these <b>Terms of Use</b> and
        commit to interacting with AI responsibly. Any misuse or violation of
        these terms may result in account suspension or removal.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">1. Responsible Usage</h2>
      <p className="mb-4">
        You must use this platform <b>with good intentions</b>. Any form of
        harmful or abusive activity is strictly prohibited. The AI customization
        tools are designed to enhance communication, not to promote harmful or
        misleading content.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">2. Prohibited Content</h2>
      <p className="mb-4">
        When adding <b>Custom Instructions</b>, you <b>must not</b> include:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Sexual content</li>
        <li>Violent or repulsive material</li>
        <li>Hate speech or abusive language</li>
        <li>Harmful or dangerous acts</li>
        <li>Spam or misleading information</li>
        <li>Any content that violates legal or ethical guidelines</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        3. Violations & Consequences
      </h2>
      <p className="mb-4">
        If you violate these Terms of Use, the platform may take{" "}
        <b>appropriate action</b>, including:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>Restricting or removing inappropriate content</li>
        <li>Suspending or terminating your account</li>
        <li>Gaining access to your instructions for moderation purposes</li>
      </ul>

      <p className="mb-4">
        These measures are in place to ensure a <b>safe and constructive</b>{" "}
        experience for all users.
      </p>
    </div>
  )
}

export function PrivacyPolicy() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
      <p className="mb-4">
        Your privacy is a priority. This policy explains how your data is
        collected, used, and protected when using this platform.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        1. What Data Is Collected?
      </h2>
      <p className="mb-4">
        The platform stores <b>Custom Instructions (System Prompts)</b> that you
        create to modify AI responses. These instructions are private by default
        and are only accessible to:
      </p>
      <ul className="list-disc pl-6 mb-4">
        <li>You, the creator</li>
        <li>
          The platform team (for moderation and enforcement of Terms of Use)
        </li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        2. How Is Your Data Used?
      </h2>
      <p className="mb-4">
        Your <b>Custom Instructions</b> are used solely for generating AI
        responses and improving your experience. Your data is{" "}
        <b>never shared with third parties</b> without your consent.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        3. Your Control Over Data
      </h2>
      <p className="mb-4">You have full control over your data. You can:</p>
      <ul className="list-disc pl-6 mb-4">
        <li>Create new instructions</li>
        <li>Read and review existing instructions</li>
        <li>Update or modify any instructions</li>
        <li>Delete your instructions permanently</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        4. Moderation & Compliance
      </h2>
      <p className="mb-4">
        If you violate the <b>Terms of Use</b>, the platform may review your
        instructions and take necessary action, including account suspension or
        termination.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">
        5. Security & Best Practices
      </h2>
      <p className="mb-4">
        The platform implements strict security measures to protect your data.
        However, you should{" "}
        <b>avoid adding sensitive, personal, or confidential information</b> to
        your instructions.
      </p>

      <p className="mt-6">
        If you have any questions or concerns about privacy, contact our support
        team.
      </p>
    </div>
  )
}
