import React from "react";
import ImagePicker from "./image-picker";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@/supabase/types";
import ImageDesigner from "./image-designer";

const DesignTab = ({
  project_id,
  current_image,
  setValues,
  edited_current_image,
}: {
  project_id: string;
  current_image: string;
  setValues: (values: any) => void;
  edited_current_image: string;
}) => {
  const {
    isPending,
    error,
    data: project,
  } = useQuery({
    queryKey: ["image-picker"],
    queryFn: () =>
      fetch(`/api/projects/${project_id}`).then((res) => res.json()),
  }) as {
    isPending: boolean;
    error: Error | null;
    data: Project;
  };

  if (isPending) return "Loading...";

  if (error) return "An error has occurred: " + error.message;

  return (
    <div className="grid grid-cols-2 w-full gap-10">
      <ImageDesigner
        project={project}
        current_image={current_image}
        member_id={project?.member_id || ""}
        edited_current_image={edited_current_image}
        setValues={setValues}
      />
      <ImagePicker
        images={project?.images || []}
        member_id={project?.member_id || ""}
        current_image={current_image}
        setValues={setValues}
        edited_current_image={edited_current_image}
      />
    </div>
  );
};

export default DesignTab;
6;
