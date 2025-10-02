"use client";

import type { PartialTreeFile, PartialTreeFolderNode, Uppy } from "@uppy/core";
import { useRemoteSource } from "@uppy/react";
import type { AvailablePluginsKeys } from "@uppy/remote-sources";
import { Ref, RefAttributes, useEffect, useRef, useState } from "react";
import Image from "next/image";
import GoogleDriveIcon from "../../../../public/src-icons/google-drive.png";
import DropboxIcon from "../../../../public/src-icons/dropbox.png";
import { SideDrawer } from "../../ui/side-drawer";
import { Button } from "../../ui/button";
import {
  IconCheck,
  IconChevronRight,
  IconFile,
  IconFolders,
  IconLink,
  IconLoader,
} from "@tabler/icons-react";
import { Checkbox } from "../../ui/checkbox";
import { cn } from "@/lib/utils";
import RemoteSrcFileLoad from "../../loading-skeletons/remote-src-file-load";

const methodTitle: Record<string, string> = {
  GoogleDrive: "Google Drive",
  Dropbox: "Dropbox",
};

function File({
  item,
  checkbox,
}: {
  item: PartialTreeFile;
  checkbox: (item: PartialTreeFile, checked: boolean) => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (ref.current && (item.status as string) === "partial") {
      (ref.current as HTMLInputElement).indeterminate = true;
    }
  }, [item.status]);

  console.log(item);

  return (
    <li
      key={item.id}
      className={cn(
        {
          "!bg-accent/50": item.status === "checked",
        },
        "group flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer relative animations"
      )}
      onClick={() => checkbox(item, false)}
    >
      <Checkbox
        ref={ref as Ref<HTMLButtonElement> | undefined}
        id={`file-checkbox-${item.id}`}
        checked={item.status === "checked"}
        onCheckedChange={(checked) => checkbox(item, false)}
        className="flex-shrink-0 hidden"
      />

      <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
        {item.data.thumbnail ? (
          <Image
            src={item.data.thumbnail || "/placeholder.svg"}
            alt="file thumbnail"
            className="w-8 h-8 rounded object-cover border border-border/50"
            width={32}
            height={32}
          />
        ) : (
          <IconFile className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <span className="text-sm  text-foreground group-hover:text-accent-foreground transition-colors text-wrap line-clamp-1 block">
          {item.data.name}
        </span>
      </div>

      <div className="absolute right-0 top-0 h-full px-2 flex items-center justify-center">
        <div
          className={cn(
            {
              "scale-[100%]": item.status === "checked",
              "scale-0": item.status !== "checked",
            },
            "bg-primary/90 text-background rounded-full p-1 animations "
          )}
        >
          <IconCheck stroke={2} size={14} />
        </div>
      </div>
    </li>
  );
}

function Folder({
  item,
  checkbox,
  open,
}: {
  item: PartialTreeFolderNode;
  checkbox: (item: PartialTreeFolderNode, checked: boolean) => void;
  open: (folderId: string | null) => Promise<void>;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (ref.current && item.status === "partial") {
      // Can only be set via JS
      (ref.current as HTMLInputElement).indeterminate = true;
    }
  }, [item.status]);

  return (
    <li className="group flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors duration-200">
      <Checkbox
        ref={ref}
        onChange={() => checkbox(item, false)}
        checked={item.status === "checked"}
        className="flex-shrink-0 hidden"
      />

      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2 p-0 h-auto font-normal text-left justify-start hover:bg-transparent group-hover:text-primary transition-colors"
        onClick={() => open(item.id)}
      >
        <div className="flex-shrink-0 text-blue-500 group-hover:text-blue-600 transition-colors">
          <IconFolders stroke={2} size={40} />
        </div>
        <span className="truncate text-sm text-foreground group-hover:text-foreground/90">
          {item.data.name}
        </span>
      </Button>
    </li>
  );
}

function TriggerIcon({ id }: { id: string }) {
  switch (id) {
    case "GoogleDrive":
      return (
        <div className="flex flex-col items-center gap-2 text-sm ">
          <div className="upload-icons">
            <Image
              src={GoogleDriveIcon || "/placeholder.svg"}
              height={50}
              width={50}
              alt="upload images with Google Drive"
              aria-label="Google Drive"
            />
          </div>
          <p className="text-muted-foreground">Google Drive</p>
        </div>
      );

    case "Dropbox":
      return (
        <div className="flex flex-col items-center gap-2 text-sm ">
          <div className="upload-icons">
            <Image
              src={DropboxIcon || "/placeholder.svg"}
              height={50}
              width={50}
              alt="upload images with Dropbox"
              aria-label="Dropbox"
            />
          </div>
          <p className="text-muted-foreground">Dropbox</p>
        </div>
      );
  }
}
function DrawerIcon({ id }: { id: string }) {
  switch (id) {
    case "GoogleDrive":
      return (
        <div className="p-2 shadow-md rounded-md inset-shadow-2xs ring-4 ring-muted-foreground/5 bg-white">
          <Image
            src={GoogleDriveIcon || "/placeholder.svg"}
            height={30}
            width={30}
            alt="upload images with Google Drive"
            aria-label="Google Drive"
          />
        </div>
      );

    case "Dropbox":
      return (
        <div className="p-2 shadow-md rounded-md inset-shadow-2xs ring-4 ring-muted-foreground/5 bg-white">
          <Image
            src={DropboxIcon || "/placeholder.svg"}
            height={30}
            width={30}
            alt="upload images with Dropbox"
            aria-label="Dropbox"
          />
        </div>
      );
  }
}

export function RemoteSource({
  uppy,
  close,
  id,
}: {
  uppy: Uppy;
  close: () => void;
  id: AvailablePluginsKeys;
}) {
  const [DrawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const { state, login, logout, checkbox, open, done, cancel } =
    useRemoteSource(id);

  const handleDone = async () => {
    setIsLoading(true);

    const selected = state.partialTree.filter(
      (n) => n.type === "file" && n.status === "checked"
    ) as Array<PartialTreeFile>;

    const filePromises = selected.map(async (file) => {
      try {
        const fileId = file.data.requestPath || file.data.id;

        // Use a server-side proxy to avoid CORS issues
        const response = await fetch(
          `/api/proxy-drive-file?fileId=${fileId}&source=${id}`
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch file: ${response.status}`);
        }

        const blob = await response.blob();

        // Add the blob directly to Uppy
        uppy.addFile({
          name: file.data.name as string,
          type: file.data.mimeType || "application/octet-stream",
          size: file.data.size,
          data: blob,
          source: `${id}Import`,
        });

        console.log(`[v0] Successfully added ${file.data.name} to Uppy`);
        return { success: true, fileName: file.data.name };
      } catch (error) {
        console.error(`Failed to add ${file.data.name} to Uppy:`, error);
        return { success: false, fileName: file.data.name, error };
      }
    });

    const results = await Promise.all(filePromises);

    const successful = results.filter((r) => r.success).length;
    const failed = results.filter((r) => !r.success).length;

    setIsLoading(false);
    setDrawerOpen(false);
  };

  useEffect(() => {
    if (!state.authenticated && DrawerOpen) {
      login();
    }
  }, [state.authenticated, DrawerOpen]);

  return (
    <SideDrawer
      open={DrawerOpen}
      icon={<DrawerIcon id={id} />}
      onOpenChange={setDrawerOpen}
      trigger={<TriggerIcon id={id} />}
      title={methodTitle[id] ? methodTitle[id] : "Remote Source"}
      description={`Select images from ${
        methodTitle[id] ? methodTitle[id] : "remote source"
      }`}
      direction="right"
      width="600px"
      footer={
        Boolean(state.authenticated) || !state.partialTree.length ? (
          <div className="flex flex-col  w-full justify-between gap-3 p-4 ">
            <div className="flex flex-row items-center gap-0">
              {state.breadcrumbs.map((breadcrumb, index) => {
                console.log(breadcrumb);
                return (
                  <div
                    key={breadcrumb.id}
                    className="text-sm text-muted-foreground flex flex-row items-center gap-0"
                  >
                    {state.breadcrumbs.length <= 1 ? (
                      <span>
                        {methodTitle[id] ? methodTitle[id] : "Remote Source"}
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => open(breadcrumb.id)}
                        className="hover:!text-primary animations cursor-pointer"
                      >
                        {/* @ts-expect-error fix later */}
                        {breadcrumb?.data?.name || methodTitle[id] || "Root"}
                      </button>
                    )}
                    {index < state.breadcrumbs.length - 1 && (
                      <IconChevronRight stroke={1} size={18} className="mx-1" />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-row items-center  gap-2">
              <Button
                type="button"
                onClick={handleDone}
                disabled={state.selectedAmount < 1 || isLoading}
              >
                {isLoading && <IconLoader className="animate-spin" />} Add{" "}
                {state.selectedAmount}{" "}
                {state.selectedAmount > 1 ? "images" : "image"}
              </Button>
              <Button
                variant={"secondary"}
                disabled={isLoading}
                type="button"
                onClick={() => {
                  setDrawerOpen(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-row  w-full  p-4 gap-2">
            <Button className="w-fit" onClick={() => login()}>
              <IconLink stroke={2} />
              Connect Your {methodTitle[id]
                ? methodTitle[id]
                : "Remote Source"}{" "}
              Account
            </Button>
            <Button onClick={() => setDrawerOpen(false)} variant={"secondary"}>
              Cancel
            </Button>
          </div>
        )
      }
    >
      <div className="pb-24">
        {Boolean(state.authenticated) && (
          <div className="relative flex flex-col">
            <ul className="flex-1 space-y-2">
              {state.loading ? (
                <div className="flex flex-col gap-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <RemoteSrcFileLoad key={i} />
                  ))}
                </div>
              ) : (
                state.partialTree.map((item) => {
                  if (item.type === "file") {
                    if (!item.data.mimeType.startsWith("image/")) return null;

                    return (
                      <File key={item.id} item={item} checkbox={checkbox} />
                    );
                  }
                  if (item.type === "folder") {
                    return (
                      <Folder
                        key={item.id}
                        item={item}
                        checkbox={checkbox}
                        open={open}
                      />
                    );
                  }
                  return null;
                })
              )}
            </ul>
          </div>
        )}
      </div>
    </SideDrawer>
  );
}
