import React from "react";
import { Button } from "../ui/button";
import CustomUploadButton from "./upload/custom-upload-btn";
import Uppy from "@uppy/core";
import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { supabase } from "@/supabase";
import { createNewProject } from "@/supabase/helpers";

export enum FormSteps {
  upload = "upload",
  design = "design",
  export = "export",
}

const FormNavigation = ({ uppy }: { uppy: Uppy }) => {
  const [loading, setLoading] = React.useState(false);
  const [values, setValues] = useQueryStates(
    {
      step: parseAsStringEnum<FormSteps>(Object.values(FormSteps)).withDefault(
        FormSteps.upload
      ),
      project_id: parseAsString.withDefault(""),
    },
    {
      history: "push",
    }
  );
  const { step, project_id } = values;

  const handleNextStep = async () => {
    setLoading(true);

    switch (step) {
      case FormSteps.upload:
        try {
          const uploadedImages = await uppy.upload();
          const imagesToAdd: string[] = (uploadedImages?.successful || [])
            .map((file) => file.response?.body?.path || "")
            .filter((path) => path !== "");

          const { data: project } = !project_id
            ? await createNewProject(imagesToAdd)
            : { data: { id: project_id } }; //will need to upsert if more images are added to existing project

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
