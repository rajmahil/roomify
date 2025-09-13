import { IconShare, IconUpload, IconVectorBezier } from "@tabler/icons-react";
import React from "react";

const FormStepper = () => {
  return (
    <div className="flex flex-row items-center gap-0 text-muted-foreground/60">
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-1.5 !text-primary">
          <div className="rounded-full ">
            <IconUpload stroke={2} size={16} />
          </div>
          <p className="text-sm">Upload</p>
        </div>
      </div>
      <div className="w-10 h-px bg-muted-foreground/50 mx-4 rounded-full"></div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-1.5">
          <div className="rounded-full ">
            <IconVectorBezier stroke={2} size={16} />
          </div>
          <p className="text-sm">Design</p>
        </div>
      </div>
      <div className="w-10 h-px bg-muted-foreground/50 mx-4 rounded-full"></div>
      <div className="flex flex-col gap-2">
        <div className="flex flex-row items-center gap-1.5">
          <div className="rounded-full ">
            <IconShare stroke={2} size={16} />
          </div>
          <p className="text-sm">Export</p>
        </div>
      </div>
    </div>
  );
};

export default FormStepper;
