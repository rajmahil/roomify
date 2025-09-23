"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type React from "react";
import { saveImage as saveImageUtil } from "@/lib/saveImage";
import { useEffect, useRef, useState } from "react";
import { useDashbaordSearchParams } from "../search-params";

const ImagePickerCanvas = ({
  drawMode,
  member_id,
}: {
  drawMode: boolean;
  member_id: string;
}) => {
  const { project_id, current_image, setValues } = useDashbaordSearchParams();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState("#FF0000");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const canvasContainer = canvasContainerRef.current;
    if (!canvasContainer) return;

    const observer = new ResizeObserver(() => {
      const height = canvasContainer.clientHeight;
      const width = canvasContainer.clientWidth;

      setCanvasDimensions({ width, height });

      console.log(height, width);
    });

    observer.observe(canvasContainer);

    return () => observer.disconnect();
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = brushColor;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.beginPath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = "/scenic-mountain-landscape.jpg";
  };

  const saveImage = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      await saveImageUtil({
        canvasRef: canvasRef as React.RefObject<HTMLCanvasElement>,
        memberId: member_id,
        currentImage: current_image,
        setValues: (values) => {
          console.log("Image saved:", values);
          // Handle the saved image reference here

          setValues({
            refine_instructions_image: values.refine_instructions_image,
          });
        },
        uploadOnly: false, // Set to true if you only want to upload, not download
      });
    } catch (error) {
      console.error("Failed to save image:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={cn(
        {
          "pointer-events-none hidden": !drawMode,
        },
        "absolute z-1 inset-0 w-full h-full"
      )}
      ref={canvasContainerRef}
    >
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        className="border border-border rounded-lg cursor-crosshair max-w-full "
        style={{ touchAction: "none" }}
        height={canvasDimensions.height}
        width={canvasDimensions.width}
      />

      <Button
        size="sm"
        variant="outline"
        className="absolute bottom-4 left-4 bg-transparent"
        onClick={saveImage}
        disabled={isSaving}
      >
        {isSaving ? "Saving..." : "Save Image"}
      </Button>
    </div>
  );
};

export default ImagePickerCanvas;
