import { useQuery } from "@tanstack/react-query";
import React from "react";
import Image from "next/image";
import { Project } from "@/supabase/types";

const ImagePicker = ({ project_id }: { project_id: string }) => {
  const { isPending, error, data } = useQuery({
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

  console.log(data, "Image data");

  return (
    <div>
      {(data?.images || []).map((image: string) => (
        <div>
          <Image
            key={image}
            src={`${process.env.NEXT_PUBLIC_SUPABASE_STORE_BUCKET_URL}${data.member_id}/${image}`}
            alt=""
            width={200}
            height={200}
          />
        </div>
      ))}
    </div>
  );
};

export default ImagePicker;
