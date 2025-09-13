import { addImageUrlAsBlob } from "@/lib/addImageAsBlob";
import Uppy, { Meta, PluginTarget, UnknownPlugin } from "@uppy/core";
import { useRef, useState } from "react";
import { Input } from "../ui/input";

function UrlUpload({ uppy, close }: { uppy: Uppy; close: () => void }) {
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addByUrl = async () => {
    const url = inputRef.current?.value?.trim();
    if (!url) return;
    setLoading(true);
    try {
      const urlPlugin: any = uppy.getPlugin("Url");

      if (!urlPlugin) {
        console.error("Url plugin not found on Uppy instance");
        setLoading(false);
        return;
      }

      const uploadedFile = await addImageUrlAsBlob(uppy, url);
      await uppy.setFileMeta(uploadedFile, { previewUrl: url });

      close();
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 min-w-[420px]">
      <label className="block text-sm mb-2">Paste a file URL</label>
      <Input
        ref={inputRef}
        type="url"
        placeholder="https://example.com/image.jpg"
        className="w-full border rounded px-3 py-2"
      />

      <div className="mt-3 flex gap-2">
        <button onClick={addByUrl} className="text-blue-600">
          {loading ? "Adding…" : "Add"}
        </button>
        <button onClick={close} className="text-gray-600">
          Cancel
        </button>
      </div>
    </div>
  );
}

export default UrlUpload;
