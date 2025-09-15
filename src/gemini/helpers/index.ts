export const generateImage = async (
  prompt: string,
  imageUrls: string[],
  original_image: string
) => {
  const newProjectReq = await fetch("/api/image-to-image", {
    method: "POST",
    body: JSON.stringify({ prompt, imageUrls, original_image }),
  });

  if (!newProjectReq.ok) {
    throw new Error("Failed to create project");
  }

  const data = await newProjectReq.json();

  return data;
};
