"use client";

import Uppy from "@uppy/core";
import { FilesGrid, UppyContextProvider } from "@uppy/react";
import { useState } from "react";
import Xhr from "@uppy/xhr-upload";
import Url from "@uppy/url";
import "@uppy/react/css/style.css";
import CustomDropzone from "@/components/dashboard/custom-drop-zone";
import CustomFilesGrid from "@/components/dashboard/custom-grid";
import { Button } from "../ui/button";
import CustomUploadButton from "./custom-upload-btn";
import FormStepper from "./form-stepper";
import Transloadit, {
  COMPANION_URL,
  COMPANION_ALLOWED_HOSTS,
} from "@uppy/transloadit";
import ThumbnailGenerator from "@uppy/thumbnail-generator";
import RemoteSources from "@uppy/remote-sources";
import GoldenRetriever from "@uppy/golden-retriever";

function UploadDashboard() {
  const [uppy] = useState(() => {
    const uppyInstance = new Uppy()

      .use(Xhr, {
        endpoint: "/api/upload",
      })
      .use(GoldenRetriever)
      .use(RemoteSources, {
        companionUrl: COMPANION_URL,
        companionAllowedHosts: COMPANION_ALLOWED_HOSTS,
        sources: ["Dropbox", "GoogleDrive", "Url"], // <- include Url **here**
        companionKeysParams: {
          GoogleDrive: {
            key: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY || "",
            credentialsName: "google-drive",
          },
          Dropbox: {
            key: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY || "",
            credentialsName: "dropbox",
          },
          Url: {
            key: process.env.NEXT_PUBLIC_TRANSLOADIT_KEY || "",
            credentialsName: "url",
          },
        },
      })
      .use(ThumbnailGenerator, {
        thumbnailWidth: 600,
        waitForThumbnailsBeforeUpload: false, // don't block UI
      });

    uppyInstance.on("upload-progress", (file, progress) => {
      console.log("[v0] Upload progress:", progress);
    });

    uppyInstance.on("upload", () => {
      console.log("[v0] Upload started");
    });

    uppyInstance.on("upload-success", (file, response) => {
      console.log("[v0] Upload success:", file?.name, response);
    });

    uppyInstance.on("complete", (result) => {
      console.log("[v0] Upload complete:", result);
    });

    uppyInstance.on("upload-error", (file, error, response) => {
      console.log("[v0] Upload error:", error, response);
    });

    return uppyInstance;
  });

  return (
    <section className="section-padding">
      <div className="max-w-[1600px] mx-auto ">
        <UppyContextProvider uppy={uppy}>
          <div className="max-w-6xl mx-auto flex flex-col gap-8 w-full ring-5 ring-muted p-8 rounded-lg bg-white dark:bg-stone-900">
            <FormStepper />
            <article className="relative">
              <CustomDropzone uppy={uppy} />
            </article>
            <CustomFilesGrid columns={5} uppy={uppy} />
            {/* <FilesGrid /> */}
            <div className="w-full flex items-center justify-end gap-2">
              <Button variant={"secondary"} size={"lg"}>
                Clear All
              </Button>
              <CustomUploadButton uppy={uppy} />
            </div>
          </div>
        </UppyContextProvider>
      </div>
    </section>
  );
}

export default UploadDashboard;
