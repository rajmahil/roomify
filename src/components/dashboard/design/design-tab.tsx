import React from "react";
import ImagePicker from "./image-picker";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@/supabase/types";
import ImageDesigner from "./image-designer";
import { useDashbaordSearchParams } from "../search-params";

const DesignTab = () => {
  const { project_id, current_image, edited_current_image, setValues } =
    useDashbaordSearchParams();

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
      <ImageDesigner project={project} member_id={project?.member_id || ""} />
      <ImagePicker
        images={project?.images || []}
        member_id={project?.member_id || ""}
      />
    </div>
  );
};

export default DesignTab;
6;
