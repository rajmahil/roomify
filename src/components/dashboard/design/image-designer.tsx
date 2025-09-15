import { Project } from "@/supabase/types";
import React from "react";
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
} from "@tabler/icons-react";

export const spaceTypes = [
  "Bedroom",
  "Living Room",
  "Dining Room",
  "Home Office",
  "Kitchen",
  "Single Bedroom",
  "Outdoor",
  "Bathroom",
  "Foyer",
  "Basement",
  "Kids Room",
  "Nursery",
] as const;

export type SpaceType = (typeof spaceTypes)[number];

export const spaceIcons: Record<SpaceType, React.ComponentType<any>> = {
  Bedroom: IconBed,
  "Living Room": IconSofa,
  "Dining Room": IconToolsKitchen2,
  "Home Office": IconHome2,
  Kitchen: IconFridge,
  "Single Bedroom": IconBed,
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
  prompt: z.string().min(3).max(150),
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
      prompt: "",
    },
  });

  const generateImageMutation = useMutation({
    mutationFn: ({
      prompt,
      imageUrls,
      original_image,
    }: {
      prompt: string;
      imageUrls: string[];
      original_image: string;
    }) => generateImage(prompt, imageUrls, original_image),
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
      prompt: values.prompt,
      imageUrls: [imageUrl],
      original_image: current_image,
    });
  }

  return (
    <div>
      <h2>{project?.name}</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="spaceType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>Space Type</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col"
                  >
                    {spaceTypes.map((type) => {
                      const Icon = spaceIcons[type];
                      return (
                        <FormItem
                          className="flex items-center gap-3"
                          key={type}
                        >
                          <FormControl>
                            <RadioGroupItem value={type} />
                          </FormControl>
                          <FormLabel className="font-normal flex flex-row items-center gap-2">
                            <Icon />
                            {type}
                          </FormLabel>
                        </FormItem>
                      );
                    })}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="prompt"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prompt</FormLabel>
                <FormControl>
                  <Textarea placeholder="Enter your prompt" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={generateImageMutation.isPending}>
            {generateImageMutation.isPending ? "Generating..." : "Submit"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ImageDesigner;
