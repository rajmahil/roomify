"use client";

import { useUppyState } from "@uppy/react";
import type { UppyFile, Uppy } from "@uppy/core";
import { X, FileIcon, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { IconArrowsMaximize, IconTrash, IconX } from "@tabler/icons-react";
import Image from "next/image";
import { useEffect } from "react";

interface CustomFilesGridProps {
  columns?: number;
  uppy: Uppy;
}

export default function CustomFilesGrid({
  columns = 3,
  uppy,
}: CustomFilesGridProps) {
  const files = useUppyState(uppy, (state) => state.files);
  const totalProgress = useUppyState(uppy, (state) => state.totalProgress);

  const fileArray = Object.values(files);

  const removeFile = (fileId: string) => {
    uppy?.removeFile(fileId);
  };

  const isImage = (
    file: UppyFile<Record<string, unknown>, Record<string, unknown>>
  ) => {
    return file.type?.startsWith("image/");
  };

  function isBlobLike(x: object): x is Blob {
    return (
      !!x &&
      typeof x === "object" &&
      "type" in (x as object) &&
      "size" in (x as object)
    );
  }

  function isImageFile(file: UppyFile<any, any>) {
    return (file.type ?? file.meta?.type)?.toString().startsWith("image/");
  }

  const getFilePreview = (file: UppyFile<any, any>) => {
    if (typeof file.preview === "string") return file.preview;
    if (typeof file.meta?.previewUrl === "string") return file.meta.previewUrl; // <—
    if (typeof file.meta?.thumbnailUrl === "string")
      return file.meta.thumbnailUrl;
    if (isImageFile(file) && isBlobLike(file.data))
      return URL.createObjectURL(file.data);
    return null;
  };

  useEffect(() => {
    const urls: string[] = [];
    Object.values(files).forEach((f) => {
      const p = getFilePreview(f as any);
      if (p?.startsWith("blob:")) urls.push(p);
    });
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [files]);

  return (
    <div
      className={`grid gap-4`}
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
    >
      {fileArray.map((file) => {
        console.log(file);
        const preview = getFilePreview(file);
        const progress = file.progress?.percentage || 0;
        const isComplete = progress === 100;
        const hasError = file.error;

        return (
          <Card key={file.id} className="relative overflow-hidden">
            <CardContent className="aspect-square relative bg-muted/50 rounded-lg overflow-hidden ">
              <div className="absolute top-0 left-0 w-full h-full bg-black/15"></div>
              {preview ? (
                <Image
                  src={preview}
                  alt={file.name || "File preview"}
                  width={500}
                  height={500}
                  className="w-full h-full object-cover object-center bg-muted"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  {isImage(file) ? (
                    <ImageIcon className="w-12 h-12 text-muted-foreground " />
                  ) : (
                    <FileIcon className="w-12 h-12 text-muted-foreground" />
                  )}
                </div>
              )}

              {/* Remove button */}
              <Button
                variant={"ghost"}
                size="icon"
                className="absolute top-1 right-1 w-6 h-6 text-white cursor-pointer "
                onClick={() => removeFile(file.id)}
              >
                <IconX stroke={3} className="h-4 w-4 drop-shadow-xl" />
              </Button>
            </CardContent>

            <CardFooter className="flex flex-col  gap-1 items-start">
              <p className="text-sm font-normal truncate" title={file.name}>
                {file.name}
              </p>

              <div className="flex flex-row items-center gap-2 text-muted-foreground text-sm">
                <div className="flex flex-row items-center gap-1">
                  <IconArrowsMaximize stroke={2} size={14} />
                  <p className="text-sm ">
                    {file.size
                      ? `${Math.round(file.size / 1024)} KB`
                      : "Unknown size"}
                  </p>
                </div>
                <div className="h-px w-3  bg-muted-foreground" />

                {!isComplete && !hasError ? (
                  <div className="flex flex-row items-center gap-1 ">
                    <div className="h-2.5 w-2.5 bg-yellow-500 rounded-xs"></div>
                    <p className="text-sm">Upload Ready</p>
                  </div>
                ) : !hasError ? (
                  <div className="flex flex-row items-center gap-1 ">
                    <div className="h-2.5 w-2.5 bg-green-600 rounded-xs"></div>
                    <p className="text-sm">Uploaded</p>
                  </div>
                ) : (
                  <div className="flex flex-row items-center gap-1 ">
                    <div className="h-2.5 w-2.5 bg-red-600 rounded-xs"></div>
                    <p className="text-sm">Failed</p>
                  </div>
                )}
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
