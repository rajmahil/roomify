import { supabase } from "@/supabase";
import { GoogleGenAI } from "@google/genai"; // adjust import based on actual package
import fs from "node:fs";
import path from "node:path";

type InlinePart = { inlineData?: { data: string; mimeType?: string } };
type Candidate = { content?: { parts?: InlinePart[] } };

// Acceptable byte types in Node or Browser
type Uploadable = Buffer | Uint8Array | ArrayBuffer | Blob | File;

type UploadItem = {
  path: string; // e.g. "orgs/123/listings/abc/ai/v1/img-1.png"
  bytes: Uploadable; // Buffer/Uint8Array/Blob/File
  mime: string; // e.g. "image/png"
  upsert?: boolean; // default false
  cacheControl?: string; // default "31536000"
};

type SingleResult = { path: string; data: any; error: any | null };
export type ManyResult = {
  successes: SingleResult[];
  errors: { path: string; error: any }[];
};

export class GeminiClient {
  private ai: GoogleGenAI;
  private supabase = supabase;

  constructor(private apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey: this.apiKey });
  }

  private async urlToBase64(url: string) {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString("base64");
  }

  private normPath(p: string) {
    return p.replace(/^\/+/, ""); // no leading slash
  }

  async textToImage(prompt: string) {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: prompt,
    });

    const candidates = (response as any)?.candidates as Candidate[] | undefined;
    const parts = candidates?.[0]?.content?.parts ?? [];
    if (!parts.length) throw new Error("No content returned by model");

    const saved: string[] = [];

    let index = 0;
    for (const p of parts) {
      const b64 = p.inlineData?.data;
      if (!b64) continue; // skip text parts like “Here is your image...”
      const mime = p.inlineData?.mimeType || "image/png";
      const ext = mime === "image/jpeg" ? "jpg" : mime.split("/")[1] || "png";
      const filePath = path.resolve(`test-${++index}.${ext}`);

      fs.writeFileSync(filePath, Buffer.from(b64, "base64"));

      // Upload the image
      await this.uploadImages([
        { path: "1233", bytes: Buffer.from(b64, "base64"), mime },
      ]);

      saved.push(filePath);
    }

    if (!saved.length)
      throw new Error("No inline image data found in response");

    return saved;
  }

  async textToText(prompt: string) {
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const candidates = (response as any)?.candidates as Candidate[] | undefined;
    const parts = candidates?.[0]?.content?.parts ?? [];
    if (!parts.length) throw new Error("No content returned by model");

    // Extract text content from the response
    const textParts = parts
      .filter((p) => !p.inlineData) // Only text parts, not inline data
      .map((p) => (p as any).text)
      .filter(Boolean);

    if (!textParts.length) throw new Error("No text content found in response");

    return textParts.join("");
  }

  async imageToImageAndText(
    prompt: string,
    images: string[],
    member_id: string,
    original_image: string
  ) {
    const imageParts = await Promise.all(
      images.map(async (url) => {
        const b64 = await this.urlToBase64(url);
        const ext = path.extname(url).toLowerCase();
        const mime =
          ext === ".jpg" || ext === ".jpeg"
            ? "image/jpeg"
            : ext === ".webp"
            ? "image/webp"
            : "image/png"; // default

        return {
          inlineData: {
            mimeType: mime,
            data: b64,
          },
        };
      })
    );

    const contents = [
      {
        text: prompt,
      },
      ...imageParts,
    ];

    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-image-preview",
      contents: contents,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const candidates = (response as any)?.candidates as Candidate[] | undefined;
    const parts = candidates?.[0]?.content?.parts ?? [];
    if (!parts.length) throw new Error("No content returned by model");

    const saved: string[] = [];

    const index = 0;
    for (const p of parts) {
      const b64 = p.inlineData?.data;
      if (!b64) continue; // skip text parts like “Here is your image...”
      const mime = p.inlineData?.mimeType || "image/png";
      const ext = mime === "image/jpeg" ? "jpg" : mime.split("/")[1] || "png";

      const originalImagePath = original_image.includes("--edit--")
        ? original_image.split("--edit--")[0]
        : original_image;
      const filePath = `${originalImagePath}--edit--${Date.now()}.${ext}`;

      await this.uploadImages([
        {
          path: `/${member_id}/${filePath}`,
          bytes: Buffer.from(b64, "base64"),
          mime,
        },
      ]);

      saved.push(filePath);
    }

    if (!saved.length)
      throw new Error("No inline image data found in response");

    return saved;
  }

  async uploadImages(
    arg1: string | UploadItem[],
    bytes?: Uploadable,
    mime?: string,
    upsert = false
  ): Promise<SingleResult | ManyResult> {
    // MULTI
    if (Array.isArray(arg1)) {
      const items = arg1;
      const results = await Promise.allSettled(
        items.map(async (it) => {
          const { data, error } = await this.supabase.storage
            .from("images")
            .upload(this.normPath(it.path), it.bytes, {
              contentType: it.mime,
              upsert: !!it.upsert,
              cacheControl: it.cacheControl ?? "31536000",
            });

          if (error) throw { path: it.path, error };
          return { path: it.path, data, error: null as any };
        })
      );

      const successes: SingleResult[] = [];
      const errors: { path: string; error: any }[] = [];

      for (const r of results) {
        if (r.status === "fulfilled") successes.push(r.value);
        else errors.push(r.reason);
      }

      return { successes, errors };
    }

    // SINGLE
    const singlePath = this.normPath(arg1);
    const { data, error } = await this.supabase.storage
      .from("images")
      .upload(singlePath, bytes as Uploadable, {
        contentType: mime!,
        upsert,
        cacheControl: "31536000",
      });

    return { path: singlePath, data, error: error ?? null };
  }
}
