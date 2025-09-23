"use client";

import { IconLoader } from "@tabler/icons-react";
import Image from "next/image";

import { useState } from "react";

interface ImageDisplayProps {
  image: string;
  member_id: string;
  edited_current_image: string;
}

export default function ImageDisplay({
  image,
  member_id,
  edited_current_image,
}: ImageDisplayProps) {
  const [loading, setLoading] = useState(true);

  const getImageUrl = () => {
    const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_STORE_BUCKET_URL || "";
    const basePath = `${member_id}/`;

    // Extract the base image name (before --edit-- if it exists)
    const baseImageName = image.includes("--edit--")
      ? image.split("--edit--")[0]
      : image;

    // Use edited image if it starts with the base name, otherwise use original
    const finalImageName = edited_current_image?.startsWith(baseImageName)
      ? edited_current_image
      : image;

    return `${baseUrl}${basePath}${finalImageName}`;
  };

  return (
    <div className="relative">
      <Image
        key={image}
        src={getImageUrl() || "/placeholder.svg"}
        alt="User uploaded image"
        width={800}
        height={800}
        className={`bg-muted object-cover border transition-all duration-300 ${
          loading ? "blur-sm" : ""
        }`}
        onLoad={() => setLoading(false)}
        onError={() => setLoading(false)}
      />
      {loading && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <IconLoader className="w-8 h-8 animate-spin text-white" />
        </div>
      )}
    </div>
  );
}
