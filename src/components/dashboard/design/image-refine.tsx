import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useDashbaordSearchParams } from "../search-params";
import { generateImageRefine } from "@/gemini/helpers";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  prompt: z
    .string({
      error: "Prompt is required",
    })
    .min(3)
    .max(100),
});

const ImageRefine = ({ member_id }: { member_id: string }) => {
  const { current_image, refine_instructions_image, setValues } =
    useDashbaordSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: "",
    },
  });

  const generateImageRefineMutation = useMutation({
    mutationFn: ({
      prompt,
      imageUrls,
      original_image,
    }: {
      prompt: string;
      imageUrls: string[];
      original_image: string;
    }) => generateImageRefine(prompt, original_image, imageUrls),
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
    const refineImageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_STORE_BUCKET_URL}${member_id}/${refine_instructions_image}`;

    console.log({
      prompt: values.prompt,
      imageUrls: [imageUrl, refineImageUrl],
      original_image: current_image,
    });

    generateImageRefineMutation.mutate({
      prompt: values.prompt,
      imageUrls: [imageUrl, refineImageUrl],
      original_image: current_image,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 ">
        <FormField
          control={form.control}
          name="prompt"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Instructions</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any additional instructions.."
                  rows={20}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button disabled={generateImageRefineMutation.isPending} type="submit">
          Submit
        </Button>
      </form>
    </Form>
  );
};

export default ImageRefine;
