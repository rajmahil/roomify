import React from "react";
import { Button } from "../ui/button";
import CustomUploadButton from "./upload/custom-upload-btn";
import Uppy from "@uppy/core";
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { supabase } from "@/supabase";
import { createNewProject } from "@/supabase/helpers";
import { FormSteps, useDashbaordSearchParams } from "./search-params";

const FormNavigation = ({ uppy }: { uppy: Uppy }) => {
  const { project_id, step, setValues } = useDashbaordSearchParams();
  const [loading, setLoading] = React.useState(false);

  const handleNextStep = async () => {
    setLoading(true);

    switch (step) {
      case FormSteps.upload:
        try {
          const uploadedImages = await uppy.upload();
          const imagesToAdd: string[] = (uploadedImages?.successful || [])
            .map((file) => file.response?.body?.path || "")
            .filter((path) => path !== "");

          const { data: project } = await createNewProject(
            imagesToAdd,
            project_id
          );

          setValues({
            step: FormSteps.design,
            project_id: project.id.toString(),
          });
        } catch (error) {
          console.log(error);
        } finally {
          setLoading(false);
        }

        break;
      case FormSteps.design:
        setValues({ step: FormSteps.export });
        break;
      case FormSteps.export:
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-full flex items-center justify-end gap-2">
      {step === FormSteps.upload && (
        <>
          <Button variant={"secondary"} size={"lg"}>
            Reset
          </Button>
          <CustomUploadButton
            loading={loading}
            handleNextStep={handleNextStep}
            uppy={uppy}
          />
        </>
      )}
      {step === FormSteps.design && (
        <>
          <Button
            variant={"secondary"}
            size={"lg"}
            onClick={() => setValues({ step: FormSteps.upload })}
          >
            <IconChevronLeft /> Back
          </Button>
        </>
      )}
    </div>
  );
};

export default FormNavigation;
