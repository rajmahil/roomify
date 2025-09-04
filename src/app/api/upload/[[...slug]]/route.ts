import { Server } from "@tus/server";
import { FileStore } from "@tus/file-store";
import { NextRequest, NextResponse } from "next/server";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { GeminiClient } from "@/gemini/client";
import { geminiClient } from "@/gemini";
import { getCurrentUser } from "../../../../../utils/supabase/auth/get-user";

export const config = {
  api: {
    bodyParser: false,
  },
};

const server = new Server({
  // `path` needs to match the route declared by the next file router
  // ie /api/upload
  path: "/api/upload",
  datastore: new FileStore({ directory: "./files" }),
});

export const GET = async (req: NextRequest) => server.handleWeb(req);
export const PATCH = async (req: NextRequest) => server.handleWeb(req);
export const DELETE = async (req: NextRequest) => server.handleWeb(req);
export const OPTIONS = async (req: NextRequest) => server.handleWeb(req);
export const HEAD = async (req: NextRequest) => server.handleWeb(req);

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Extract bytes + metadata from the incoming File
    const arrayBuffer = await file.arrayBuffer();
    const bytes = Buffer.from(arrayBuffer); // or: new Uint8Array(arrayBuffer)
    const mime = file.type || "application/octet-stream";

    // Make a safe filename (or generate a unique one)
    const filename = file.name?.trim().replace(/\s+/g, "-") || "upload.bin";
    const pathId = `${Date.now()}-${filename}`;

    // Send to Gemini (adjust field names if your SDK expects different keys)
    await geminiClient.uploadImages([
      { path: `${user?.id}/${pathId}`, bytes, mime }, // some SDKs use mimeType instead of mime
    ]);

    return NextResponse.json({
      message: "File uploaded successfully",
      filename,
      path: pathId,
      mime,
      size: bytes.length,
    });
  } catch (err) {
    console.error("Error uploading file:", err);
    return NextResponse.json(
      { error: "Error uploading file" },
      { status: 500 }
    );
  }
}
