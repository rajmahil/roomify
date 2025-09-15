import { geminiClient } from "@/gemini";
import { supabase } from "@/supabase";
import { getCurrentUser } from "../../../../utils/supabase/auth/get-user";

export async function POST(request: Request) {
  const { prompt, imageUrls, original_image } = await request.json();

  const user = await getCurrentUser();

  const response = await geminiClient.imageToImageAndText(
    prompt,
    imageUrls,
    user?.id as string,
    original_image
  );

  // const images = await supabase.storage.from("images").list()

  console.log(response, "Response from Gemini");

  return Response.json(response);
}
