# ParxAI

ParxAI is an AI application that enables users to control, personalize, and share how AI responds using Custom Instructions (system prompts), with a strong focus on privacy, safety, and consistency.

Instead of relying on a single generic AI behavior, ParxAI allows users to create reusable instruction profiles that define how the AI should think, respond, and format outputs for different use cases.

---

## Features

### Custom Instructions

- Create system-level instructions that guide AI behavior
- Control tone, depth, structure, and constraints
- Switch instructions instantly per use case

### Shareable Instruction Profiles

- Share instruction profiles with others
- Reuse community-created instructions
- Keep instructions private unless explicitly shared

### Privacy-First Design

- Instructions are private by default
- Only the user and the platform can access stored instructions
- Users can create, edit, or delete instructions at any time

### Safety and Validation

- Instructions are validated to prevent harmful usage
- Restricted content includes harmful, offensive, sexual, violent, or misleading instructions
- Violations may result in removal or account restrictions

### Consistent AI Responses

- Ensures stable and predictable AI behavior across sessions
- Reduces repetitive prompting
- Improves relevance and output quality

---

## How It Works

1. The user creates a Custom Instruction
2. The instruction is applied as a system prompt
3. All AI responses follow the active instruction
4. Instructions can be shared or kept private

---

## Terms of Service (Summary)

- The platform must be used with good intentions
- Instructions must follow content and safety guidelines
- The platform may access instruction data only in case of policy violations
- Violations may lead to suspension or restricted access

---

## Privacy Policy (Summary)

- Instructions are private by default
- Only the user and the platform can access stored data
- Users can create, read, update, and delete their data
- Shared instructions are public only when explicitly shared

---

## Use Cases

- Developers enforcing coding standards
- Writers controlling tone and style
- Educators requiring structured explanations
- Interview preparation with consistent responses
- Teams standardizing AI behavior

---

## Tech Stack

### Frontend

- Next.js 16 (App Router)
- React Server Components and cacheComponents

### Styling

- Tailwind CSS
- shadcn/ui

### AI Layer

- Gemini AI API
- System-prompt-based instruction injection

### Authentication

- NextAuth.js
- Secure session-based authentication

### Database

- MongoDB with Mongoose
- User, instruction, and metadata storage

### Caching

- Upstash Redis
- Response and instruction caching

### Media & Assets

- Cloudinary for image storage and optimization
- Giphy API for GIF integration

### Infrastructure

- Server-side rendering and edge-compatible APIs
- Secure environment variable management

---

## Installation

To run the project locally, follow these steps:

1. Clone the repository:

   ```bash
   git clone https://github.com/snvshal/parx-ai.git
   ```

2. Navigate to the project directory:

   ```bash
   cd parx-ai
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Create a `.env.local` file and set your environment variables.

5. Run the development server:

   ```bash
   npm run dev
   ```

6. Open your browser at [http://localhost:3000](http://localhost:3000) to see the app in action.

---

## Roadmap

- Instruction versioning
- Public instruction discovery
- Rating and feedback system
- Team-based shared instructions
- Instruction export and import

---

## Contributing

Contributions and feedback are welcome. Please open issues or propose improvements where relevant.

---

## License

MIT
