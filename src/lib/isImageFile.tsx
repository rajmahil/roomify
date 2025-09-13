type FileObject = {
  mimeType?: string;
  [key: string]: any;
};

export function isImageFile(file: FileObject): boolean {
  if (!file || !file.mimeType) return false;
  return file.mimeType.startsWith("image/");
}
