import { geminiClient } from "@/gemini";
import { supabase } from "@/supabase";

export async function POST(request: Request) {
  const { prompt } = await request.json();
  const response = await geminiClient.imageToImageAndText(prompt, [
    "https://bkngqoknovmaxmpmiuyh.supabase.co/storage/v1/object/public/images/Artboard%202.png",
    "https://bkngqoknovmaxmpmiuyh.supabase.co/storage/v1/object/public/images/123",
  ]);

  //   const images = await supabase.storage.from("images").list()

  return Response.json(response);
}
