import type React from "react";
import { createClient } from "../../utils/supabase/client";

interface SaveImageOptions {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  memberId: string;
  currentImage: string;
  setValues: (values: { refine_instructions_image: string }) => void;
  uploadOnly?: boolean; // Add option to only upload or also download
}

export const saveImage = async ({
  canvasRef,
  memberId,
  currentImage,
  setValues,
  uploadOnly = false,
}: SaveImageOptions) => {
  const canvas = canvasRef.current;
  if (!canvas) return;

  const compositeCanvas = document.createElement("canvas");
  const compositeCtx = compositeCanvas.getContext("2d");
  if (!compositeCtx) return;

  // Set the composite canvas to the same size as the original
  compositeCanvas.width = canvas.width;
  compositeCanvas.height = canvas.height;

  const fileName = `${currentImage}--refine-instructions--${Date.now()}.png`;

  const uploadBlob = async (blob: Blob) => {
    try {
      const supabase = createClient();
      const filePath = `${memberId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from("images") // Replace with your actual bucket name
        .upload(filePath, blob, {
          contentType: "image/png",
          upsert: false,
        });

      console.log(data, error, "Upload response");

      if (error) {
        console.error("Upload error:", error);
        throw error;
      }

      setValues({
        refine_instructions_image: fileName,
      });

      console.log("File uploaded successfully:", data);
      return data;
    } catch (error) {
      console.error("Upload failed:", error);
      throw error;
    }
  };

  // const downloadBlob = (blob: Blob, fileName: string) => {
  //   const url = URL.createObjectURL(blob);
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.download = `${fileName}.png`;
  //   document.body.appendChild(link);
  //   link.click();
  //   document.body.removeChild(link);
  //   URL.revokeObjectURL(url);
  // };

  // Load the background image
  const backgroundImg = new Image();
  backgroundImg.crossOrigin = "anonymous";

  return new Promise<void>((resolve, reject) => {
    backgroundImg.onload = () => {
      // Draw the background image first
      compositeCtx.drawImage(
        backgroundImg,
        0,
        0,
        compositeCanvas.width,
        compositeCanvas.height
      );

      // Draw the canvas content (user's drawing) on top
      compositeCtx.drawImage(canvas, 0, 0);

      compositeCanvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error("Failed to create blob"));
          return;
        }

        try {
          // Upload to Supabase
          await uploadBlob(blob);

          // Download locally if not upload-only
          // if (!uploadOnly) {
          //   downloadBlob(blob, fileName);
          // }

          resolve();
        } catch (error) {
          reject(error);
        }
      }, "image/png");
    };

    backgroundImg.onerror = () => {
      reject(new Error("Failed to load background image"));
    };

    const imageUrl = process.env.NEXT_PUBLIC_SUPABASE_STORE_BUCKET_URL
      ? `${process.env.NEXT_PUBLIC_SUPABASE_STORE_BUCKET_URL}${memberId}/${currentImage}`
      : `/placeholder.svg?height=400&width=600&query=background image`;

    backgroundImg.src = imageUrl;
  });
};
