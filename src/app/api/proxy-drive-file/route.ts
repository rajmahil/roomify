import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const fileId = searchParams.get("fileId");
  const source = searchParams.get("source");

  if (!fileId) {
    return NextResponse.json({ error: "File ID required" }, { status: 400 });
  }

  try {
    let downloadUrl: string;
    let fetchOptions: RequestInit = {};

    if (source === "GoogleDrive") {
      downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
    } else if (source === "Dropbox") {
      // Dropbox uses different URL format
      downloadUrl = `https://content.dropboxapi.com/2/files/download`;

      // Dropbox paths need to start with / if they don't already
      const dropboxPath = fileId.startsWith("/") ? fileId : `/${fileId}`;

      fetchOptions = {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
          "Dropbox-API-Arg": JSON.stringify({ path: dropboxPath }),
        },
      };
    } else {
      return NextResponse.json(
        { error: "Unsupported source" },
        { status: 400 }
      );
    }

    const response = await fetch(downloadUrl, {
      headers:
        source === "Dropbox"
          ? {
              Authorization: `Bearer ${process.env.DROPBOX_ACCESS_TOKEN}`,
              "Dropbox-API-Arg": JSON.stringify({ path: fileId }),
            }
          : {},
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const blob = await response.blob();

    return new NextResponse(blob, {
      headers: {
        "Content-Type":
          response.headers.get("Content-Type") || "application/octet-stream",
        "Content-Length": response.headers.get("Content-Length") || "",
      },
    });
  } catch (error) {
    console.error("Proxy download error:", error);
    return NextResponse.json(
      { error: "Failed to download file" },
      { status: 500 }
    );
  }
}
