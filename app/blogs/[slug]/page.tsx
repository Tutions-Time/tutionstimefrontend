import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { fetchPublishedBlog, getImageSrc } from "@/services/blogService";

type Props = {
  params: { slug: string };
};

export const dynamic = "force-dynamic";

function formatDate(value?: string) {
  if (!value) return "";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const blog = await fetchPublishedBlog(params.slug);

  if (!blog) {
    return {
      title: "Blog Not Found - TuitionsTime",
    };
  }

  const title = blog.metaTitle || `${blog.title} - TuitionsTime Blog`;
  const description = blog.metaDescription || blog.excerpt;
  const image = getImageSrc(blog.coverImage);

  return {
    title,
    description,
    alternates: {
      canonical: `https://tuitionstime.com/blogs/${blog.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://tuitionstime.com/blogs/${blog.slug}`,
      siteName: "TuitionsTime",
      type: "article",
      images: image ? [{ url: image, alt: blog.coverImageAlt || blog.title }] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const blog = await fetchPublishedBlog(params.slug);
  if (!blog) notFound();

  const image = getImageSrc(blog.coverImage);
  const paragraphs = blog.content
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter(Boolean);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.metaDescription || blog.excerpt,
    image: image || undefined,
    datePublished: blog.publishedAt || blog.createdAt,
    dateModified: blog.updatedAt,
    author: {
      "@type": "Organization",
      name: blog.authorName || "TuitionsTime Team",
    },
    publisher: {
      "@type": "Organization",
      name: "TuitionsTime",
      url: "https://tuitionstime.com",
    },
    mainEntityOfPage: `https://tuitionstime.com/blogs/${blog.slug}`,
  };

  return (
    <div className="min-h-screen bg-white">
      <Script
        id="blog-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        <article>
          <section className="bg-slate-50">
            <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
              <Link href="/blogs" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                Back to blogs
              </Link>
              <div className="mt-6 flex flex-wrap items-center gap-2">
                <Badge className="bg-primary/15 text-slate-900 border-primary/20">
                  {blog.category || "Education"}
                </Badge>
                {blog.publishedAt ? (
                  <span className="text-sm text-slate-500">
                    {formatDate(blog.publishedAt)}
                  </span>
                ) : null}
              </div>
              <h1 className="mt-4 text-4xl font-bold leading-tight text-slate-900">
                {blog.title}
              </h1>
              <p className="mt-5 text-lg leading-8 text-slate-600">
                {blog.excerpt}
              </p>
              <p className="mt-4 text-sm text-slate-500">
                By {blog.authorName || "TuitionsTime Team"}
              </p>
            </div>
          </section>

          {image ? (
            <div className="mx-auto max-w-5xl px-4 pt-10 sm:px-6 lg:px-8">
              <img
                src={image}
                alt={blog.coverImageAlt || blog.title}
                className="aspect-[16/9] w-full rounded-lg object-cover"
              />
            </div>
          ) : null}

          <section className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
            <div className="space-y-6 text-base leading-8 text-slate-700">
              {paragraphs.map((paragraph, index) => {
                if (paragraph.startsWith("## ")) {
                  return (
                    <h2 key={index} className="pt-4 text-2xl font-bold text-slate-900">
                      {paragraph.replace(/^##\s+/, "")}
                    </h2>
                  );
                }

                return <p key={index}>{paragraph}</p>;
              })}
            </div>

            {blog.tags && blog.tags.length > 0 ? (
              <div className="mt-10 flex flex-wrap gap-2 border-t border-slate-200 pt-6">
                {blog.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-slate-600">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
