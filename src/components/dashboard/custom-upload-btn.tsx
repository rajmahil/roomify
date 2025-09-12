import Uppy from "@uppy/core";
import { Button } from "../ui/button";
import { parseAsInteger, useQueryStates } from "nuqs";

function CustomUploadButton({ uppy }: { uppy: Uppy }) {
  const [dashValues, setDashValues] = useQueryStates(
    {
      currStep: parseAsInteger.withDefault(1),
    },
    {
      history: "push",
    }
  );

  const handleUpload = () => {
    uppy.upload();

    setDashValues({ currStep: dashValues.currStep + 1 });
  };

  return (
    <Button size={"lg"} onClick={handleUpload} className="w-fit">
      Upload & Continue to Design
    </Button>
  );
}

export default CustomUploadButton;
