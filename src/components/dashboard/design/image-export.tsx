import React from "react";
import { useDashbaordSearchParams } from "../search-params";
import { useQuery } from "@tanstack/react-query";
import { Project } from "@/supabase/types";

const ImageExport = () => {
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

  console.log(project, "Project Data in Export");

  return (
    <div className="grid grid-cols-2 w-full gap-10">
      <div className="flex flex-col items-center space-y-4"></div>
      <h3 className="text-lg font-semibold">Original Image</h3>
      {/* {current_image && (
        <>
          <img
            src={current_image}
            alt="Original"
            className="max-w-full h-auto rounded-lg shadow-md"
          />
          <button
            onClick={() => {
              const link = document.createElement("a");
              link.href = current_image;
              link.download = "original-image.jpg";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Download Original
          </button>
        </>
      )} */}
    </div>
  );
};

export default ImageExport;
