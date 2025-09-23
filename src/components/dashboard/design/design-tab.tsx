import React from "react";
import ImagePicker from "./image-picker";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@/supabase/types";
import ImageDesigner from "./image-designer";
import { useDashbaordSearchParams } from "../search-params";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ImageDefurnish from "./image-defurnish";
import ImageRefine from "./image-refine";

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
      <Tabs defaultValue="furnish" className="w-full flex flex-col gap-6">
        <TabsList className="w-full">
          <TabsTrigger value="furnish">Furnish</TabsTrigger>
          <TabsTrigger value="defurnish">De-Furnish</TabsTrigger>
          <TabsTrigger value="refine">Refine</TabsTrigger>
        </TabsList>
        <TabsContent value="furnish">
          <ImageDesigner
            project={project}
            member_id={project?.member_id || ""}
          />
        </TabsContent>
        <TabsContent value="defurnish">
          <ImageDefurnish member_id={project?.member_id || ""} />
        </TabsContent>
        <TabsContent value="refine">
          <ImageRefine member_id={project?.member_id || ""} />
        </TabsContent>
      </Tabs>
      <ImagePicker
        images={project?.images || []}
        member_id={project?.member_id || ""}
      />
    </div>
  );
};

export default DesignTab;
