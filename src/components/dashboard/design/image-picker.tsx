import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createNewProject } from "@/supabase/helpers";
import { useDashbaordSearchParams } from "../search-params";
import { m as motion, LazyMotion, domAnimation } from "motion/react";
import { IconLoader } from "@tabler/icons-react";
import ImagePickerCanvas from "./image-picker-canvas";

const ImagePicker = ({
  images,
  member_id,
}: {
  images: string[];
  member_id: string;
}) => {
  const { project_id, current_image, edited_current_image, setValues } =
    useDashbaordSearchParams();

  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);
  const [loading, setLoading] = React.useState(false);
  const [drawMode, setDrawMode] = React.useState<boolean>(true);

  const queryClient = useQueryClient();
  const updateProject = useMutation({
    mutationFn: ({
      imageUrls,
      project_id,
    }: {
      imageUrls: string[];
      project_id: string;
    }) => createNewProject(imageUrls, project_id),
    onSuccess: (data) => {
      setValues({ edited_current_image: "" });
      queryClient.invalidateQueries({ queryKey: ["image-picker"] });

      setTimeout(() => {
        setLoading(false);
      }, 1000);
    },
    onError: (error) => {
      console.error("Error updating project:", error);
      setLoading(false);
    },
  });

  const handleImageSave = () => {
    setLoading(true);

    const updatedImages = images.map((img) =>
      img.startsWith(current_image) ? edited_current_image || img : img
    );
    updateProject.mutate({ imageUrls: updatedImages, project_id });
  };

  React.useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);
  React.useEffect(() => {
    if (current) {
      const selectedImage = images[current - 1];
      setValues({ current_image: selectedImage });
    }
  }, [current, api]);

  return (
    <Carousel setApi={setApi} opts={{ active: !drawMode }}>
      <CarouselContent>
        {(images || []).map((image: string) => (
          <CarouselItem
            className="overflow-hidden relative"
            key={image}
            onClick={() => {
              const index = images.indexOf(image);
              if (api) {
                api.scrollTo(index);
                setCurrent(index + 1);
              }
            }}
          >
            <div className=" w-fit h-fit relative overflow-hidden rounded-lg ">
              <ImagePickerCanvas />
              <div className="absolute top-2 right-2 z-10 flex flex-row gap-1">
                <Badge variant={"default"}>Editing</Badge>
                <Badge>
                  {current} / {count}
                </Badge>
              </div>
              <div className="relative">
                <Image
                  key={image}
                  src={`${
                    process.env.NEXT_PUBLIC_SUPABASE_STORE_BUCKET_URL
                  }${member_id}/${
                    edited_current_image.startsWith(
                      image.split("--edit--")
                        ? image.split("--edit--")[0]
                        : image
                    )
                      ? edited_current_image
                      : image
                  }`}
                  alt=""
                  width={800}
                  height={800}
                  className={`bg-muted object-cover border transition-all duration-300 ${
                    loading ? "blur-sm" : ""
                  }`}
                />
                {loading && (
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <IconLoader className="w-8 h-8 animate-spin text-white" />
                  </div>
                )}
              </div>
              <LazyMotion features={domAnimation}>
                {edited_current_image.startsWith(
                  image.split("--edit--") ? image.split("--edit--")[0] : image
                ) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="absolute  bg-gradient-to-t from-stone-900/70 to-transparent  h-24 bottom-0 left-0 w-full"></div>
                    <div className="absolute z-10 bottom-0 left-0 w-full p-6 flex flex-row items-center justify-center gap-1">
                      <Button onClick={handleImageSave} disabled={loading}>
                        {loading && <IconLoader className="animate-spin" />}
                        Save Changes
                      </Button>
                      <Button
                        disabled={loading}
                        onClick={() => {
                          setValues({ edited_current_image: "" });
                        }}
                        variant={"secondary"}
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </LazyMotion>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default ImagePicker;
