import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { BlogPost, fetchPublishedBlogs, getImageSrc } from "@/services/blogService";

export const metadata: Metadata = {
  title: "TuitionsTime Blog - Learning Tips, Tutor Guides & Education Insights",
  description:
    "Read TuitionsTime blogs for study tips, tutoring advice, parent guides, exam preparation support, and education insights.",
  alternates: {
    canonical: "https://tuitionstime.com/blogs",
  },
};

export const dynamic = "force-dynamic";

function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function BlogCard({ blog }: { blog: BlogPost }) {
  const image = getImageSrc(blog.coverImage);

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {image ? (
        <Link href={`/blogs/${blog.slug}`} className="block aspect-[16/9] bg-slate-100">
          <img
            src={image}
            alt={blog.coverImageAlt || blog.title}
            className="h-full w-full object-cover"
          />
        </Link>
      ) : null}
      <div className="p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <Badge className="bg-primary/15 text-slate-900 border-primary/20">
            {blog.category || "Education"}
          </Badge>
          {blog.publishedAt ? (
            <span className="text-xs text-slate-500">
              {formatDate(blog.publishedAt)}
            </span>
          ) : null}
        </div>
        <h2 className="text-xl font-bold leading-7 text-slate-900">
          <Link href={`/blogs/${blog.slug}`} className="hover:text-primary">
            {blog.title}
          </Link>
        </h2>
        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
          {blog.excerpt}
        </p>
        <Link
          href={`/blogs/${blog.slug}`}
          className="mt-5 inline-flex text-sm font-semibold text-slate-900 hover:text-primary"
        >
          Read article
        </Link>
      </div>
    </article>
  );
}

export default async function BlogsPage() {
  const data = await fetchPublishedBlogs({ limit: 24 });
  const blogs: BlogPost[] = data.blogs || [];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <section className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-primary">
              TuitionsTime Blog
            </p>
            <h1 className="max-w-3xl text-4xl font-bold leading-tight text-slate-900">
              Learning Tips, Tutor Guides, and Education Insights
            </h1>
            <p className="mt-4 max-w-3xl leading-7 text-slate-600">
              Practical articles for students, parents, and tutors who want to
              make learning more focused, flexible, and effective.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          {blogs.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {blogs.map((blog) => (
                <BlogCard key={blog.slug} blog={blog} />
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-600">
              No blogs published yet.
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
}
