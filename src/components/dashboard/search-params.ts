import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

export enum FormSteps {
  upload = "upload",
  design = "design",
  export = "export",
}

export const useDashbaordSearchParams = () => {
  const [values, setValues] = useQueryStates(
    {
      step: parseAsStringEnum<FormSteps>(Object.values(FormSteps)).withDefault(
        FormSteps.upload
      ),
      project_id: parseAsString.withDefault(""),
      current_image: parseAsString.withDefault(""),
      edited_current_image: parseAsString.withDefault(""),
    },
    {
      history: "replace",
    }
  );

  return { ...values, setValues };
};
