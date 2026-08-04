const normalizeAbsoluteImageUrl = (value: string) => {
  if (/^http:\/\/api\.tuitionstime\.com\//i.test(value)) {
    return value.replace(/^http:\/\//i, "https://");
  }
  if (/^http:\/\/tuitionstime\.com\//i.test(value)) {
    return value.replace(/^http:\/\//i, "https://");
  }
  return value;
};

export const getImageUrl = (path?: string | null) => {
  if (!path) return "";
  const value = String(path).trim();
  if (!value) return "";
  if (/^(blob:|data:)/i.test(value)) return value;
  if (/^https?:\/\//i.test(value)) return normalizeAbsoluteImageUrl(value);

  const base =
    process.env.NEXT_PUBLIC_IMAGE_URL?.replace(/\/$/, "") ||
    process.env.NEXT_PUBLIC_API_URL?.replace(/\/api\/?$/, "").replace(/\/$/, "") ||
    "http://127.0.0.1:5000";

  const cleaned = value
    .replace(/^([A-Za-z]:)?[\\/]+tutionstimebackend[\\/]+/, "")
    .replace(/^[A-Za-z]:[\\/].*?[\\/]uploads[\\/]/i, "uploads/")
    .replace(/\\/g, "/")
    .replace(/^.*uploads\//, "uploads/");

  return `${base}${cleaned.startsWith("/") ? cleaned : `/${cleaned}`}`;
};

export const getAvatarUrl = (path?: string | null) =>
  getImageUrl(path) || "/default-avatar.png";

