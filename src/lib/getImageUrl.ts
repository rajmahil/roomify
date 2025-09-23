export const getImageUrl = (memberId: string, imagePath: string) => {
  return `${process.env.NEXT_PUBLIC_SUPABASE_STORE_BUCKET_URL}images/${memberId}/${imagePath}`;
};
