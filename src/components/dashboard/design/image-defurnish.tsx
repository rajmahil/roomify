import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useDashbaordSearchParams } from "../search-params";
import { generateImageDefurnish } from "@/gemini/helpers";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  removeAll: z.boolean().optional(),
});

const ImageDefurnish = ({ member_id }: { member_id: string }) => {
  const { current_image, setValues } = useDashbaordSearchParams();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      removeAll: false,
    },
  });

  const generateDefurnishImageMutation = useMutation({
    mutationFn: ({
      imageUrls,
      original_image,
      member_id,
    }: {
      imageUrls: string[];
      original_image: string;
      member_id: string;
    }) => generateImageDefurnish(imageUrls, original_image, member_id, true),
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

    console.log(imageUrl, "Image URL");

    generateDefurnishImageMutation.mutate({
      imageUrls: [imageUrl],
      original_image: current_image,
      member_id,
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 ">
        <p className="text-muted-foreground">
          Remove all furniture with the toggle below, or use Draw Mode to select
          specific items.
        </p>
        <FormField
          control={form.control}
          name="removeAll"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 ">
              <div className="space-y-0.5">
                <FormLabel>Remove All Furniture</FormLabel>
                <FormDescription>
                  Remove all furniture from the room.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <Button
          type="submit"
          disabled={generateDefurnishImageMutation.isPending}
        >
          {generateDefurnishImageMutation.isPending
            ? "Generating..."
            : "Generate De-Furnished Image"}
        </Button>
      </form>
    </Form>
  );
};

export default ImageDefurnish;
