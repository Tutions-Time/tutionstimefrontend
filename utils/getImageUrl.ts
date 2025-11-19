export const getImageUrl = (path?: string | null) => {
  if (!path) return "";
  const base =
    process.env.NEXT_PUBLIC_IMAGE_URL?.replace(/\/$/, "") || "";
  if (path.startsWith("http")) return path;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
};