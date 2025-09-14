import Uppy from "@uppy/core";
import { Button } from "../../ui/button";
import { parseAsInteger, parseAsStringEnum, useQueryStates } from "nuqs";
import React from "react";
import { IconLoader } from "@tabler/icons-react";

function CustomUploadButton({
  uppy,
  handleNextStep,
  loading,
}: {
  uppy: Uppy;
  loading: boolean;
  handleNextStep: () => void;
}) {
  return (
    <Button
      size={"lg"}
      onClick={handleNextStep}
      className="w-fit"
      disabled={loading}
    >
      {loading && <IconLoader className="animate-spin " />}
      Upload & Continue to Design
    </Button>
  );
}

export default CustomUploadButton;
