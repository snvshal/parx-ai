export function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-4 text-2xl font-bold">Privacy Policy</h1>
      <p className="mb-4">
        Your privacy is a priority. This policy explains how your data is
        collected, used, and protected when using this platform.
      </p>

      <h2 className="mb-2 mt-6 text-xl font-semibold">
        1. What Data Is Collected?
      </h2>
      <p className="mb-4">
        The platform stores <b>Custom Instructions (System Prompts)</b> that you
        create to modify AI responses. These instructions are private by default
        and are only accessible to:
      </p>
      <ul className="mb-4 list-disc pl-6">
        <li>You, the creator</li>
        <li>
          The platform team (for moderation and enforcement of Terms of Use)
        </li>
      </ul>

      <h2 className="mb-2 mt-6 text-xl font-semibold">
        2. How Is Your Data Used?
      </h2>
      <p className="mb-4">
        Your <b>Custom Instructions</b> are used solely for generating AI
        responses and improving your experience. Your data is{" "}
        <b>never shared with third parties</b> without your consent.
      </p>

      <h2 className="mb-2 mt-6 text-xl font-semibold">
        3. Your Control Over Data
      </h2>
      <p className="mb-4">You have full control over your data. You can:</p>
      <ul className="mb-4 list-disc pl-6">
        <li>Create new instructions</li>
        <li>Read and review existing instructions</li>
        <li>Update or modify any instructions</li>
        <li>Delete your instructions permanently</li>
      </ul>

      <h2 className="mb-2 mt-6 text-xl font-semibold">
        4. Moderation & Compliance
      </h2>
      <p className="mb-4">
        If you violate the <b>Terms of Use</b>, the platform may review your
        instructions and take necessary action, including account suspension or
        termination.
      </p>

      <h2 className="mb-2 mt-6 text-xl font-semibold">
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
