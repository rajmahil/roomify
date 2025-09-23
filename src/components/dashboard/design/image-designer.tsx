import { Project } from "@/supabase/types";
import React, { useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { generateImage } from "@/gemini/helpers";
import { useDashbaordSearchParams } from "../search-params";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  IconBed,
  IconSofa,
  IconToolsKitchen2,
  IconHome2,
  IconFridge,
  IconTrees,
  IconBath,
  IconStairs,
  IconBuildingStore,
  IconMoodKid,
  IconBabyCarriage,
  IconX,
  IconCheck,
  IconLoader,
  IconSparkles,
} from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export const spaceTypes = [
  "Bedroom",
  "Living Room",
  "Dining Room",
  "Home Office",
  "Kitchen",
  "Outdoor",
  "Bathroom",
  "Foyer",
  "Basement",
  "Kids Room",
  "Nursery",
] as const;

export const spaceObjects = [
  {
    spaceType: "Bedroom",
    items: [
      { name: "Bed" },
      { name: "Nightstand" },
      { name: "Dresser" },
      { name: "Wardrobe" },
      { name: "Lamp" },
      { name: "Mirror" },
    ],
  },
  {
    spaceType: "Living Room",
    items: [
      { name: "Sofa" },
      { name: "Coffee Table" },
      { name: "TV" },
      { name: "Bookshelf" },
      { name: "Rug" },
      { name: "Armchair" },
    ],
  },
  {
    spaceType: "Dining Room",
    items: [
      { name: "Dining Table" },
      { name: "Chairs" },
      { name: "Buffet/Sideboard" },
      { name: "Chandelier" },
      { name: "Tableware" },
    ],
  },
  {
    spaceType: "Home Office",
    items: [
      { name: "Desk" },
      { name: "Office Chair" },
      { name: "Computer" },
      { name: "Bookshelf" },
      { name: "Printer" },
      { name: "Filing Cabinet" },
    ],
  },
  {
    spaceType: "Kitchen",
    items: [
      { name: "Refrigerator" },
      { name: "Stove" },
      { name: "Oven" },
      { name: "Microwave" },
      { name: "Sink" },
      { name: "Cabinets" },
      { name: "Cookware" },
    ],
  },
  {
    spaceType: "Outdoor",
    items: [
      { name: "Patio Furniture" },
      { name: "BBQ Grill" },
      { name: "Garden Tools" },
      { name: "Planters" },
      { name: "Umbrella" },
      { name: "Fire Pit" },
    ],
  },
  {
    spaceType: "Bathroom",
    items: [
      { name: "Toilet" },
      { name: "Shower" },
      { name: "Bathtub" },
      { name: "Sink" },
      { name: "Mirror" },
      { name: "Towel Rack" },
    ],
  },
  {
    spaceType: "Foyer",
    items: [
      { name: "Coat Rack" },
      { name: "Console Table" },
      { name: "Mirror" },
      { name: "Shoe Rack" },
      { name: "Umbrella Stand" },
    ],
  },
  {
    spaceType: "Basement",
    items: [
      { name: "Washer" },
      { name: "Dryer" },
      { name: "Storage Shelves" },
      { name: "Workbench" },
      { name: "Freezer" },
    ],
  },
  {
    spaceType: "Kids Room",
    items: [
      { name: "Bed" },
      { name: "Toy Box" },
      { name: "Desk" },
      { name: "Bookshelf" },
      { name: "Play Mat" },
      { name: "Closet" },
    ],
  },
  {
    spaceType: "Nursery",
    items: [
      { name: "Crib" },
      { name: "Changing Table" },
      { name: "Rocking Chair" },
      { name: "Dresser" },
      { name: "Baby Monitor" },
      { name: "Mobile" },
    ],
  },
] as const;

export const spaceStyle = [
  {
    key: "transitional",
    name: "Transitional",
    palette: "calm neutrals with navy/black accents",
    materials: "painted wood, linen, antique brass",
  },
  {
    key: "modern",
    name: "Modern",
    palette: "warm/neutral base + single bold accent",
    materials: "matte metal, glass, light-to-medium woods",
  },
  {
    key: "scandinavian",
    name: "Scandinavian",
    palette: "white/grey, pale oak, soft blue",
    materials: "oak, cotton/wool, ceramic",
  },
  {
    key: "japandi",
    name: "Japandi",
    palette: "warm beiges, charcoal/black accents",
    materials: "oak/ash, stone, linen",
  },
  {
    key: "contemporary",
    name: "Contemporary",
    palette: "soft creams/greige, airy neutrals",
    materials: "light woods, boucle, brushed metal",
  },
] as const;

export type SpaceType = (typeof spaceTypes)[number];

export const spaceIcons: Record<SpaceType, React.ComponentType<any>> = {
  Bedroom: IconBed,
  "Living Room": IconSofa,
  "Dining Room": IconToolsKitchen2,
  "Home Office": IconHome2,
  Kitchen: IconFridge,
  Outdoor: IconTrees,
  Bathroom: IconBath,
  Foyer: IconStairs,
  Basement: IconBuildingStore,
  "Kids Room": IconMoodKid,
  Nursery: IconBabyCarriage,
};

const formSchema = z.object({
  spaceType: z.enum(spaceTypes).refine((val) => val !== undefined, {
    message: "Please select a space type",
  }),
  spaceObjects: z.array(z.string()).optional(),
  spaceStyle: z.string().optional(),
  prompt: z.string().optional(),
});

const ImageDesigner = ({
  project,
  member_id,
}: {
  project: Project;
  member_id: string;
}) => {
  const { current_image, setValues } = useDashbaordSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      spaceType: "Bedroom",
    },
  });
  const spaceType = form.watch("spaceType");

  const generateImageMutation = useMutation({
    mutationFn: ({
      prompt,
      imageUrls,
      original_image,
      spaceType,
      spaceObjects,
      spaceStyle,
      member_id,
    }: {
      prompt: string;
      imageUrls: string[];
      original_image: string;
      spaceType: string;
      spaceObjects: string[];
      spaceStyle: string;
      member_id: string;
    }) =>
      generateImage(
        prompt,
        imageUrls,
        original_image,
        spaceType,
        spaceObjects,
        spaceStyle,
        member_id
      ),
    onSuccess: (data: string[]) => {
      setValues({ edited_current_image: data[0] });
      console.log(data, "Generated Image Data");
    },
    onError: (error) => {
      console.error("Error generating image:", error);
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    const imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_STORE_BUCKET_URL}${member_id}/${current_image}`;

    generateImageMutation.mutate({
      prompt: values?.prompt || "",
      imageUrls: [imageUrl],
      original_image: current_image,
      spaceType: values.spaceType,
      spaceObjects: values.spaceObjects || [],
      spaceStyle: values.spaceStyle || "",
      member_id,
    });
  }

  useEffect(() => {
    form.setValue("spaceObjects", []);
  }, [spaceType, form]);

  return (
    <div className="flex flex-col gap-10">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
          <FormField
            control={form.control}
            name="spaceType"
            render={({ field }) => (
              <FormItem>
                <Carousel
                  opts={{ align: "start" }}
                  className="w-full overflow-hidden space-y-2"
                >
                  <div className="flex flex-row items-center justify-between">
                    <FormLabel>Space Type</FormLabel>
                    <div className="flex flex-row items-center">
                      <CarouselPrevious
                        type="button"
                        variant={"ghost"}
                      ></CarouselPrevious>
                      <CarouselNext
                        type="button"
                        variant={"ghost"}
                      ></CarouselNext>
                    </div>
                  </div>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="w-fit"
                    >
                      <CarouselContent>
                        {spaceTypes.map((type) => {
                          const Icon = spaceIcons[type];
                          return (
                            <CarouselItem
                              key={type}
                              className=" basis-1/4 min-w-0 "
                            >
                              <FormItem
                                className="flex items-center gap-3"
                                key={type}
                              >
                                <FormControl>
                                  <RadioGroupItem
                                    value={type}
                                    className="hidden"
                                  />
                                </FormControl>
                                <FormLabel
                                  className={cn(
                                    {
                                      "border-primary/30 ":
                                        type === field.value,
                                    },
                                    "font-normal flex flex-col items-start justify-end gap-1 px-3 py-2 border w-full !h-24 rounded-lg relative animations cursor-pointer"
                                  )}
                                >
                                  <div
                                    className={cn(
                                      {
                                        "scale-[100%] h-4.5 w-4.5":
                                          type === field.value,
                                        "scale-0 h-0 w-0": type !== field.value,
                                      },
                                      "absolute top-2 right-2 bg-primary text-background rounded-full p-px animations"
                                    )}
                                  >
                                    <IconCheck size={16} stroke={3} />
                                  </div>

                                  <Icon size={24} stroke={1.5} />
                                  <p className="text-sm font-medium">{type}</p>
                                </FormLabel>
                              </FormItem>
                            </CarouselItem>
                          );
                        })}
                      </CarouselContent>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </Carousel>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="spaceObjects"
            render={({ field }) => {
              const selectedSpaceType = form.watch("spaceType");
              const spaceData = spaceObjects.find(
                (space) => space.spaceType === selectedSpaceType
              );
              const items = spaceData?.items || [];

              return (
                <FormItem className="space-y-2">
                  <FormLabel>Space Items</FormLabel>
                  <FormControl>
                    <div className="flex flex-row flex-wrap gap-3">
                      {items.map((item) => {
                        const isSelected =
                          field.value?.includes(item.name) || false;
                        return (
                          <div
                            key={item.name}
                            className={cn(
                              "border rounded-lg p-2 cursor-pointer transition-all animations",
                              {
                                "border-primary/30": isSelected,
                                "border-border hover:border-primary/30":
                                  !isSelected,
                              }
                            )}
                            onClick={() => {
                              const currentValues = field.value || [];
                              if (isSelected) {
                                field.onChange(
                                  currentValues.filter(
                                    (val) => val !== item.name
                                  )
                                );
                              } else {
                                field.onChange([...currentValues, item.name]);
                              }
                            }}
                          >
                            <div className="flex items-center justify-between pl-1">
                              <span className="text-sm font-medium">
                                {item.name}
                              </span>
                              <div
                                className={cn(
                                  {
                                    "scale-[100%] h-4.5 w-4.5": isSelected,
                                    "scale-0 w-0 h-0": !isSelected,
                                  },
                                  "rounded-full flex items-center justify-center bg-primary text-white p-px ml-2 animations"
                                )}
                              >
                                <IconCheck size={16} stroke={3} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="spaceStyle"
            render={({ field }) => {
              return (
                <FormItem className="space-y-2">
                  <FormLabel>Space Style</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="flex flex-row flex-wrap gap-3"
                    >
                      {spaceStyle.map((item) => {
                        const isSelected = field.value === item.key;
                        return (
                          <FormItem
                            key={item.key}
                            className="flex items-center"
                          >
                            <FormControl>
                              <RadioGroupItem
                                value={item.key}
                                className="hidden"
                              />
                            </FormControl>
                            <FormLabel
                              className={cn(
                                "border rounded-lg p-3 cursor-pointer transition-all animations flex-1",
                                {
                                  "border-primary/30": isSelected,
                                  "border-border hover:border-primary/30":
                                    !isSelected,
                                }
                              )}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                  <span className="text-sm font-medium">
                                    {item.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {item.palette}
                                  </span>
                                  <span className="text-xs text-muted-foreground">
                                    {item.materials}
                                  </span>
                                </div>
                                <div
                                  className={cn(
                                    {
                                      "scale-[100%] h-4.5 w-4.5": isSelected,
                                      "scale-0 w-0 h-0": !isSelected,
                                    },
                                    "rounded-full flex items-center justify-center bg-primary text-white p-px ml-2 animations"
                                  )}
                                >
                                  <IconCheck size={16} stroke={3} />
                                </div>
                              </div>
                            </FormLabel>
                          </FormItem>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <Button type="submit" disabled={generateImageMutation.isPending}>
            {generateImageMutation.isPending ? (
              <IconLoader className="animate-spin" />
            ) : (
              <IconSparkles stroke={2} />
            )}
            Generate Image
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ImageDesigner;
