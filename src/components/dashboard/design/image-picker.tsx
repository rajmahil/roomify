import { useQuery } from "@tanstack/react-query";
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

const ImagePicker = ({
  images,
  member_id,
  current_image,
  setValues,
  edited_current_image,
}: {
  images: string[];
  member_id: string;
  current_image: string;
  setValues: (values: any) => void;
  edited_current_image: string;
}) => {
  const [api, setApi] = React.useState<CarouselApi>();
  const [current, setCurrent] = React.useState(0);
  const [count, setCount] = React.useState(0);

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
    <Carousel setApi={setApi}>
      <CarouselContent>
        {(images || []).map((image: string) => (
          <CarouselItem
            className="overflow-hidden"
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
              <div className="absolute top-2 right-2 z-10 flex flex-row gap-1">
                <Badge variant={"default"}>Editing</Badge>
                <Badge>
                  {current} / {count}
                </Badge>
              </div>
              <Image
                key={image}
                src={`${
                  process.env.NEXT_PUBLIC_SUPABASE_STORE_BUCKET_URL
                }${member_id}/${edited_current_image || image}`}
                alt=""
                width={800}
                height={800}
                className="bg-muted object-cover border "
              />
              {edited_current_image != "" && (
                <>
                  <div className="absolute  bg-gradient-to-t from-stone-900/70 to-transparent  h-24 bottom-0 left-0 w-full"></div>
                  <div className="absolute z-10 bottom-0 left-0 w-full p-6 flex flex-row items-center justify-center gap-1">
                    <Button>Save Changes</Button>
                    <Button
                      onClick={() => {
                        setValues({ edited_current_image: "" });
                      }}
                      variant={"secondary"}
                    >
                      Cancel
                    </Button>
                  </div>
                </>
              )}
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
