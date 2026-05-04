const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export type BlogPost = {
  _id?: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  coverImageAlt?: string;
  category?: string;
  tags?: string[];
  status?: "draft" | "published" | "archived";
  metaTitle?: string;
  metaDescription?: string;
  authorName?: string;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
};

export const getImageSrc = (url?: string) => {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const base = API_BASE_URL.replace(/\/api\/?$/, "");
  return `${base}${url.startsWith("/") ? "" : "/"}${url}`;
};

export async function fetchPublishedBlogs(params?: {
  page?: number;
  limit?: number;
  q?: string;
}) {
  const search = new URLSearchParams();
  if (params?.page) search.set("page", String(params.page));
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.q) search.set("q", params.q);

  const res = await fetch(`${API_BASE_URL}/blogs?${search.toString()}`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) throw new Error("Failed to load blogs");
  const json = await res.json();
  return json.data || { blogs: [], pagination: {} };
}

export async function fetchPublishedBlog(slug: string): Promise<BlogPost | null> {
  const res = await fetch(`${API_BASE_URL}/blogs/${slug}`, {
    next: { revalidate: 300 },
  });

  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to load blog");
  const json = await res.json();
  return json.data || null;
}
