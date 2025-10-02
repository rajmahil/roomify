"use client";

import { cn } from "@/lib/utils";
import type React from "react";
import { saveImage as saveImageUtil } from "@/lib/saveImage";
import { useEffect, useRef, useState, useCallback } from "react";
import { useDashbaordSearchParams } from "../search-params";
import useImage from "use-image";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LineStroke = {
  points: number[];
  color: string;
  size: number;
};

const BackgroundImage = ({
  src,
  width,
  height,
}: {
  src: string;
  width: number;
  height: number;
}) => {
  const [img] = useImage(src, "anonymous");
  return (
    <KonvaImage
      image={img || undefined}
      x={0}
      y={0}
      width={width}
      height={height}
      listening={false}
    />
  );
};

const ImagePickerCanvas = ({
  canvasMode,
  member_id,
}: {
  canvasMode: boolean;
  member_id: string;
}) => {
  const { current_image, setValues } = useDashbaordSearchParams();

  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<any>(null);
  const tempCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const raf = () => new Promise((res) => requestAnimationFrame(res as any));

  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasDimensions, setCanvasDimensions] = useState({
    width: 0,
    height: 0,
  });
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor] = useState("#FF0000");

  // Drawing history
  const [lines, setLines] = useState<LineStroke[]>([]);
  const [redoStack, setRedoStack] = useState<LineStroke[]>([]);

  // Autosave bits
  const saveTimerRef = useRef<number | null>(null);
  const inFlightRef = useRef<boolean>(false);
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "saving" | "saved" | "error"
  >("idle");

  /** Get current stage size safely */
  const getStageSize = () => {
    const stage = stageRef.current as any;
    if (!stage) return { width: 0, height: 0 };
    const size = stage.size(); // { width, height }
    return { width: size.width ?? 0, height: size.height ?? 0 };
  };

  // Resize to container
  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      const width = el.clientWidth;
      const height = el.clientHeight;
      setCanvasDimensions({ width, height });
    });

    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Pointer helpers
  const getRelativePointerPos = useCallback(() => {
    const stage = stageRef.current as any;
    if (!stage) return { x: 0, y: 0 };
    const pointer = stage.getPointerPosition();
    return pointer || { x: 0, y: 0 };
  }, []);

  const handleMouseDown = () => {
    setIsDrawing(true);
    const { x, y } = getRelativePointerPos();

    // Start a new stroke; beginning a new stroke clears redo history
    setLines((prev) => [
      ...prev,
      { points: [x, y], color: brushColor, size: brushSize },
    ]);
    setRedoStack([]); // new action invalidates redo
  };

  const handleMouseMove = () => {
    if (!isDrawing) return;
    const { x, y } = getRelativePointerPos();
    setLines((prev) => {
      if (prev.length === 0) return prev;
      const next = prev.slice();
      const last = { ...next[next.length - 1] };
      last.points = last.points.concat([x, y]);
      next[next.length - 1] = last;
      return next;
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    scheduleAutoSave(); // ← autosave after each stroke
  };

  // Undo / Redo (unchanged)
  const canUndo = lines.length > 0 && !isDrawing;
  const canRedo = redoStack.length > 0 && !isDrawing;

  const undo = () => {
    if (!canUndo) return;
    setLines((prev) => {
      const next = prev.slice();
      const popped = next.pop()!;
      setRedoStack((r) => [...r, popped]);
      return next;
    });
    scheduleAutoSave(); // optional: autosave after undo
  };

  const redo = () => {
    if (!canRedo) return;
    setRedoStack((prev) => {
      const next = prev.slice();
      const popped = next.pop()!;
      setLines((l) => [...l, popped]);
      return next;
    });
    scheduleAutoSave(); // optional: autosave after redo
  };

  // Keyboard shortcuts (unchanged)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!canvasMode) return;
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const mod = isMac ? e.metaKey : e.ctrlKey;

      if (!mod) return;

      if (e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      if (
        (e.key.toLowerCase() === "z" && e.shiftKey) ||
        e.key.toLowerCase() === "y"
      ) {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [canvasMode, canUndo, canRedo]);

  const clearCanvas = () => {
    if (isDrawing) return;
    setLines([]);
    setRedoStack([]);
    scheduleAutoSave(); // save cleared state
  };

  // --- AUTOSAVE IMPLEMENTATION ---

  const scheduleAutoSave = useCallback(() => {
    // do not schedule when canvas is hidden
    if (!canvasMode) return;

    if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      void performAutoSave();
    }, 600);
  }, [canvasMode]);

  const performAutoSave = useCallback(async () => {
    if (!canvasMode) return; // skip if hidden
    if (inFlightRef.current) return;
    const stage = stageRef.current as any;
    if (!stage) return;

    // use stage size, bail if zero
    const { width, height } = getStageSize();
    if (width <= 0 || height <= 0) return;

    try {
      inFlightRef.current = true;
      setSaveStatus("saving"); // ← added

      // let Konva flush rendering before export
      await raf();

      const dataURL: string = stage.toDataURL({
        pixelRatio: 1,
        mimeType: "image/png",
      });

      // temp canvas MUST match stage size
      if (!tempCanvasRef.current) {
        tempCanvasRef.current = document.createElement("canvas");
      }
      const tCanvas = tempCanvasRef.current;
      tCanvas.width = width;
      tCanvas.height = height;

      const tctx = tCanvas.getContext("2d");
      if (!tctx) throw new Error("Unable to get 2D context for temp canvas");

      await new Promise<void>((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => {
          tctx.clearRect(0, 0, tCanvas.width, tCanvas.height);
          tctx.drawImage(img, 0, 0, tCanvas.width, tCanvas.height);
          resolve();
        };
        img.onerror = reject;
        img.src = dataURL;
      });

      // pass a NON-zero canvas to your save util
      const fauxRef = {
        current: tCanvas,
      } as React.RefObject<HTMLCanvasElement>;

      await saveImageUtil({
        canvasRef: fauxRef,
        memberId: member_id,
        currentImage: current_image,
        setValues: (values) => {
          setValues({
            refine_instructions_image: values.refine_instructions_image,
          });
        },
        uploadOnly: false,
      });

      setSaveStatus("saved"); // ← added
      window.setTimeout(() => setSaveStatus("idle"), 900); // ← added
    } catch (err) {
      console.error("Autosave failed:", err);
      setSaveStatus("error"); // ← added
    } finally {
      inFlightRef.current = false;
    }
  }, [canvasMode, member_id, current_image, setValues]);

  // best-effort on unload, but only if size > 0
  useEffect(() => {
    const h = () => {
      if (saveTimerRef.current) window.clearTimeout(saveTimerRef.current);
      const { width, height } = getStageSize();
      if (width > 0 && height > 0) {
        // fire-and-forget; don't await
        void performAutoSave();
      }
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [performAutoSave]);

  useEffect(() => {
    if (!canvasMode && saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
  }, [canvasMode]);

  return (
    <div
      className={cn(
        { "pointer-events-none hidden": !canvasMode },
        "absolute z-1 inset-0 w-full h-full"
      )}
      ref={canvasContainerRef}
    >
      <Stage
        ref={stageRef}
        width={canvasDimensions.width}
        height={canvasDimensions.height}
        className="border border-border rounded-lg cursor-crosshair max-w-full"
        style={{ touchAction: "none", background: "transparent" }}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onMouseleave={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
      >
        <Layer listening={false}>
          <BackgroundImage
            src={current_image}
            width={canvasDimensions.width}
            height={canvasDimensions.height}
          />
        </Layer>

        <Layer>
          {lines.map((l, i) => (
            <Line
              key={i}
              points={l.points}
              stroke={l.color}
              strokeWidth={l.size}
              lineCap="round"
              lineJoin="round"
              tension={0}
              listening={false}
            />
          ))}
        </Layer>
      </Stage>

      {/* tiny status badge — optional */}
      <div className="absolute bottom-2 left-2 text-xs rounded px-2 py-1 bg-black/60 text-white">
        {saveStatus === "saving" && "Saving…"}
        {saveStatus === "saved" && "Autosaved"}
        {saveStatus === "error" && "Save failed"}
        {saveStatus === "idle" && ""}
      </div>

      {/* Undo/Redo/ Clear — autosave triggers on those actions too */}
      <div className="absolute bottom-2 right-2 flex gap-2">
        <Input
          type="number"
          value={brushSize}
          onChange={(e) => {
            const val = parseInt(e.target.value, 10);
            if (isNaN(val) || val < 1) return setBrushSize(1);
            if (val > 100) return setBrushSize(100);
            setBrushSize(val);
          }}
          className="w-16 text-xs px-2 py-1 rounded text-center bg-white/80"
          min={1}
          max={100}
          step={1}
          aria-label="Brush Size"
        />
        <Button
          className="text-xs px-2 py-1 rounded bg-white/80"
          onClick={undo}
          disabled={!canUndo}
        >
          Undo
        </Button>
        <Button
          className="text-xs px-2 py-1 rounded bg-white/80"
          onClick={redo}
          disabled={!canRedo}
        >
          Redo
        </Button>
        <Button
          className="text-xs px-2 py-1 rounded bg-white/80"
          onClick={clearCanvas}
          disabled={isDrawing}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};

export default ImagePickerCanvas;
