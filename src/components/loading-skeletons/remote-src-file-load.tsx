import React from "react";
import { Skeleton } from "../ui/skeleton";

const RemoteSrcFileLoad = () => {
  return (
    <div className="flex flex-row items-center gap-4">
      <Skeleton className="h-14 w-14 rounded-md aspect-square" />
      <div className="w-full flex flex-col">
        <Skeleton className="h-4 w-3/4 mb-2 rounded-md" />
        <Skeleton className="h-5 w-full rounded-md" />
      </div>
    </div>
  );
};

export default RemoteSrcFileLoad;
