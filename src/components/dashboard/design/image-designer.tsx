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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { generateImage } from "@/gemini/helpers";

const formSchema = z.object({
  prompt: z.string().min(3).max(150),
});

const ImageDesigner = ({
  project,
  current_image,
  member_id,
  edited_current_image,
  setValues,
}: {
  project: Project;
  current_image: string;
  member_id: string;
  edited_current_image: string;
  setValues: (values: any) => void;
}) => {
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
    onSuccess: (data) => {
      setValues({ edited_current_image: data });
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
