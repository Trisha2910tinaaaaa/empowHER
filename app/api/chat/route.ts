import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req: Request) {
  const { messages } = await req.json()

  const result = streamText({
    model: openai("gpt-4o"),
    messages,
    system: `You are a career advisor specializing in helping women find job opportunities. 
    Your goal is to provide personalized job recommendations based on the user's experience, skills, and preferences.
    
    Follow these guidelines:
    1. Ask about their background, skills, and interests if not provided
    2. Suggest specific job roles that match their profile
    3. Be encouraging and empowering
    4. Provide actionable advice for career transitions
    5. Focus on roles where women are traditionally underrepresented if the user shows interest
    6. Suggest resources for skill development if needed
    
    Keep your responses concise, supportive, and focused on providing valuable career guidance.`,
  })

  return result.toDataStreamResponse()
}

