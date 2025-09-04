"use client";

import Uppy from "@uppy/core";
import { FilesGrid, UploadButton, UppyContextProvider } from "@uppy/react";
import { useRef, useState } from "react";
import Xhr from "@uppy/xhr-upload";
import Url from "@uppy/url";

import "@uppy/react/css/style.css";
import CustomDropzone from "@/app/dashboard/_parts/custom-drop-zone";

function UploadDashboard() {
  const [uppy] = useState(() =>
    new Uppy()
      .use(Xhr, {
        endpoint: "/api/upload",
      })
      .use(Url, {
        companionUrl: "http://localhost:3020",
      })
  );

  const dialogRef = useRef<HTMLDialogElement>(null);

  return (
    <section className="section-padding">
      <div className="max-w-[1600px] mx-auto w-full">
        <UppyContextProvider uppy={uppy}>
          <div className="max-w-md mx-auto flex flex-col gap-3">
            <article>
              <CustomDropzone openModal={(plugin) => {}} />
            </article>
            <UploadButton />
            <FilesGrid />
          </div>
        </UppyContextProvider>
      </div>
    </section>
  );
}

export default UploadDashboard;
