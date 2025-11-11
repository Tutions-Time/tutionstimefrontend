// utils/getImageUrl.ts
export function getImageUrl(path?: string | null) {
  if (!path) return "/default-avatar.png"; // fallback to default image

  const base = process.env.NEXT_PUBLIC_IMAGE_URL || "http://localhost:5000";

  // if already a full URL
  if (/^https?:\/\//i.test(path)) return path;

  // clean Windows or absolute local paths
  const cleaned = path
    .replace(/^([A-Za-z]:)?[\\/]+tutionstimebackend[\\/]+/, "")
    .replace(/\\/g, "/")
    .replace(/^.*uploads\//, "uploads/");

  // ensure final joined path looks like http://localhost:5000/uploads/...
  return `${base.replace(/\/$/, "")}/${cleaned.replace(/^\//, "")}`;
}
