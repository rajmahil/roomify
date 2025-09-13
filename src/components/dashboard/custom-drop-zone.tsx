import { useDropzone, useFileInput } from "@uppy/react";
import { RemoteSource } from "./remote-source";
import Image from "next/image";
import FolderIcon from "../../../public/src-icons/folder.png";
import UrlUpload from "./url-upload";
import Uppy from "@uppy/core";

export interface CustomDropzoneProps {
  uppy: Uppy;
}

export function CustomDropzone({ uppy }: CustomDropzoneProps) {
  const { getRootProps, getInputProps } = useDropzone({ noClick: true });
  const { getButtonProps, getInputProps: getFileInputProps } = useFileInput();

  return (
    <div className="relative z-[1]">
      <input {...getInputProps()} className="hidden" />
      <div
        {...getRootProps()}
        className="border-2 border-dashed  rounded-lg p-6 bg-muted/70 transition-colors duration-200 flex flex-col gap-6"
      >
        <p className="text-center text-muted-foreground/80">
          Drag and drop to upload files or pick from below{" "}
        </p>
        <div className="flex items-center justify-center gap-3">
          <input {...getFileInputProps()} className="hidden" />

          <button {...getButtonProps()}>
            <div className="flex flex-col items-center gap-2 text-sm">
              <div className="upload-icons">
                <Image
                  src={FolderIcon || "/placeholder.svg"}
                  height={50}
                  width={50}
                  alt="upload images from device"
                  aria-label="device"
                />
              </div>
              <p className="text-muted-foreground">Device</p>
            </div>
          </button>
          <RemoteSource close={() => {}} id="GoogleDrive" uppy={uppy} />
          <RemoteSource close={() => {}} id="Dropbox" uppy={uppy} />
          <UrlUpload close={() => {}} uppy={uppy} />
        </div>
      </div>
    </div>
  );
}

export default CustomDropzone;
