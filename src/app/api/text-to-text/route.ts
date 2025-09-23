import { geminiClient } from "@/gemini";

export async function POST(request: Request) {
  const { prompt } = await request.json();

  const response = await geminiClient.textToText(prompt);

  return Response.json(response);
}
