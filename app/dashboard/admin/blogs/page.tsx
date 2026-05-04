"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Edit3, Eye, FileText, ImagePlus, Plus, Trash2 } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { toast } from "@/hooks/use-toast";
import {
  createAdminBlog,
  deleteAdminBlog,
  getAdminBlogs,
  updateAdminBlog,
} from "@/services/adminService";
import { BlogPost, getImageSrc } from "@/services/blogService";
import { cn } from "@/lib/utils";

type BlogStatus = "draft" | "published" | "archived";

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "Education",
  tags: "",
  status: "draft" as BlogStatus,
  metaTitle: "",
  metaDescription: "",
  authorName: "TuitionsTime Team",
  coverImageAlt: "",
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);

function AdminBlogsContent() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [blogs, setBlogs] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"all" | BlogStatus>("all");
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const loadBlogs = async () => {
    try {
      setLoading(true);
      const data = await getAdminBlogs({
        q: query,
        status,
        limit: 100,
      });
      setBlogs(data.blogs || []);
    } catch (error: any) {
      toast({
        title: "Failed to load blogs",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(loadBlogs, 250);
    return () => clearTimeout(timer);
  }, [query, status]);

  const previewImage = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    return getImageSrc(editing?.coverImage);
  }, [imageFile, editing?.coverImage]);

  useEffect(() => {
    return () => {
      if (previewImage && previewImage.startsWith("blob:")) {
        URL.revokeObjectURL(previewImage);
      }
    };
  }, [previewImage]);

  const startNew = () => {
    setEditing(null);
    setForm(emptyForm);
    setImageFile(null);
  };

  const startEdit = (blog: BlogPost) => {
    setEditing(blog);
    setImageFile(null);
    setForm({
      title: blog.title || "",
      slug: blog.slug || "",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      category: blog.category || "Education",
      tags: blog.tags?.join(", ") || "",
      status: (blog.status as BlogStatus) || "draft",
      metaTitle: blog.metaTitle || blog.title || "",
      metaDescription: blog.metaDescription || blog.excerpt || "",
      authorName: blog.authorName || "TuitionsTime Team",
      coverImageAlt: blog.coverImageAlt || blog.title || "",
    });
  };

  const updateForm = (key: keyof typeof form, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && (!prev.slug || prev.slug === slugify(prev.title))) {
        next.slug = slugify(value);
      }
      if (key === "title" && !prev.coverImageAlt) {
        next.coverImageAlt = value;
      }
      if (key === "title" && !prev.metaTitle) {
        next.metaTitle = value;
      }
      if (key === "excerpt" && !prev.metaDescription) {
        next.metaDescription = value.slice(0, 160);
      }
      return next;
    });
  };

  const buildPayload = () => {
    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      payload.append(key, value);
    });
    if (imageFile) payload.append("image", imageFile);
    return payload;
  };

  const submit = async () => {
    if (!form.title.trim() || !form.excerpt.trim() || !form.content.trim()) {
      toast({
        title: "Missing blog content",
        description: "Title, excerpt, and content are required.",
        variant: "destructive",
      });
      return;
    }

    try {
      setSaving(true);
      if (editing?._id) {
        await updateAdminBlog(editing._id, buildPayload());
        toast({ title: "Blog updated" });
      } else {
        await createAdminBlog(buildPayload());
        toast({ title: "Blog created" });
      }
      startNew();
      await loadBlogs();
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const removeBlog = async (blog: BlogPost) => {
    if (!blog._id) return;
    if (!window.confirm(`Delete "${blog.title}"?`)) return;

    try {
      await deleteAdminBlog(blog._id);
      toast({ title: "Blog deleted" });
      if (editing?._id === blog._id) startNew();
      await loadBlogs();
    } catch (error: any) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const statusClass = (value?: string) =>
    value === "published"
      ? "bg-success/10 text-success border-success/20"
      : value === "archived"
        ? "bg-slate-100 text-slate-600 border-slate-200"
        : "bg-warning/10 text-warning border-warning/20";

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        userRole="admin"
        userName="Admin"
      />
      <Sidebar
        userRole="admin"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="lg:pr-64">
        <Topbar
          title="Blogs"
          subtitle="Create SEO blog posts with images, metadata, categories, and tags"
          action={
            <Button onClick={startNew} className="bg-primary text-text hover:bg-primary/90">
              <Plus className="mr-2 h-4 w-4" />
              New Blog
            </Button>
          }
        />

        <main className="grid gap-6 p-4 lg:grid-cols-[1fr_380px] lg:p-6">
          <div className="space-y-6">
            <Card className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="grid gap-3 md:grid-cols-[1fr_180px]">
                <Input
                  placeholder="Search title, excerpt, content, or tags"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <select
                  className="h-10 rounded-md border px-3 text-sm"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                >
                  <option value="all">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </Card>

            <Card className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <div className="border-b p-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-text">Blog Posts</h2>
                  {loading ? <Badge>Loading</Badge> : null}
                </div>
              </div>

              <div className="divide-y">
                {blogs.map((blog) => {
                  const image = getImageSrc(blog.coverImage);
                  return (
                    <div key={blog._id || blog.slug} className="p-4">
                      <div className="flex gap-4">
                        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {image ? (
                            <img
                              src={image}
                              alt={blog.coverImageAlt || blog.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-400">
                              <FileText className="h-6 w-6" />
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className={cn("border capitalize", statusClass(blog.status))}>
                              {blog.status || "draft"}
                            </Badge>
                            <span className="text-xs text-muted">
                              {blog.category || "Education"}
                            </span>
                          </div>
                          <h3 className="mt-2 truncate font-semibold text-text">
                            {blog.title}
                          </h3>
                          <p className="mt-1 line-clamp-2 text-sm text-muted">
                            {blog.excerpt}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button variant="outline" size="sm" onClick={() => startEdit(blog)}>
                              <Edit3 className="mr-2 h-4 w-4" />
                              Edit
                            </Button>
                            {blog.status === "published" ? (
                              <Link href={`/blogs/${blog.slug}`} target="_blank">
                                <Button variant="outline" size="sm">
                                  <Eye className="mr-2 h-4 w-4" />
                                  View
                                </Button>
                              </Link>
                            ) : null}
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeBlog(blog)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {!loading && blogs.length === 0 ? (
                  <div className="p-10 text-center text-muted">
                    No blogs found. Create the first SEO blog from the form.
                  </div>
                ) : null}
              </div>
            </Card>
          </div>

          <Card className="h-fit rounded-2xl bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-text">
                {editing ? "Edit Blog" : "Create Blog"}
              </h2>
              <p className="mt-1 text-sm text-muted">
                Published posts appear on `/blogs` and can rank as SEO pages.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Title</label>
                <Input
                  value={form.title}
                  onChange={(e) => updateForm("title", e.target.value)}
                  placeholder="How to choose the right tutor"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Slug</label>
                <Input
                  value={form.slug}
                  onChange={(e) => updateForm("slug", slugify(e.target.value))}
                  placeholder="how-to-choose-the-right-tutor"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-sm font-medium">Category</label>
                  <Input
                    value={form.category}
                    onChange={(e) => updateForm("category", e.target.value)}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium">Status</label>
                  <select
                    className="h-10 w-full rounded-md border px-3 text-sm"
                    value={form.status}
                    onChange={(e) => updateForm("status", e.target.value)}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Excerpt</label>
                <Textarea
                  value={form.excerpt}
                  onChange={(e) => updateForm("excerpt", e.target.value)}
                  placeholder="Short summary for cards and meta descriptions"
                  className="min-h-[90px]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Content</label>
                <Textarea
                  value={form.content}
                  onChange={(e) => updateForm("content", e.target.value)}
                  placeholder={"Write the blog content. Use blank lines between paragraphs and ## for section headings."}
                  className="min-h-[260px]"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Cover Image</label>
                <label className="flex cursor-pointer items-center justify-center rounded-lg border border-dashed border-slate-300 p-4 text-sm text-muted hover:bg-slate-50">
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Upload image
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                </label>
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt="Blog cover preview"
                    className="mt-3 aspect-[16/9] w-full rounded-lg object-cover"
                  />
                ) : null}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Image Alt Text</label>
                <Input
                  value={form.coverImageAlt}
                  onChange={(e) => updateForm("coverImageAlt", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Tags</label>
                <Input
                  value={form.tags}
                  onChange={(e) => updateForm("tags", e.target.value)}
                  placeholder="study tips, online tuition, exam preparation"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Meta Title</label>
                <Input
                  value={form.metaTitle}
                  onChange={(e) => updateForm("metaTitle", e.target.value)}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  Meta Description
                </label>
                <Textarea
                  value={form.metaDescription}
                  onChange={(e) => updateForm("metaDescription", e.target.value)}
                  className="min-h-[90px]"
                />
                <p className="mt-1 text-xs text-muted">
                  {form.metaDescription.length}/180 characters
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Author</label>
                <Input
                  value={form.authorName}
                  onChange={(e) => updateForm("authorName", e.target.value)}
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={submit}
                  disabled={saving}
                  className="flex-1 bg-primary text-text hover:bg-primary/90"
                >
                  {saving ? "Saving..." : editing ? "Update Blog" : "Create Blog"}
                </Button>
                <Button variant="outline" onClick={startNew} disabled={saving}>
                  Clear
                </Button>
              </div>
            </div>
          </Card>
        </main>
      </div>
    </div>
  );
}

export default function AdminBlogsPage() {
  return (
    <ProtectedRoute>
      <AdminBlogsContent />
    </ProtectedRoute>
  );
}
