export const getImageUrl = (path?: string | null) => {
  if (!path) return "";
  const value = String(path).trim();
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;

  const base =
    process.env.NEXT_PUBLIC_IMAGE_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "").replace(/\/$/, "") ||
    "";

  const cleaned = value
    .replace(/^([A-Za-z]:)?[\\/]+tutionstimebackend[\\/]+/, "")
    .replace(/\\/g, "/")
    .replace(/^.*uploads\//, "uploads/");

  return `${base}${cleaned.startsWith("/") ? cleaned : `/${cleaned}`}`;
};
