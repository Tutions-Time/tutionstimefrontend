import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Script from "next/script";
import type { ReactNode } from "react";
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

function estimateReadTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function isSafeUrl(value: string) {
  return /^(https?:\/\/|\/|#)/i.test(value);
}

function parseInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(text))) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }

    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={`${match.index}-strong`} className="font-semibold text-slate-950">
          {token.slice(2, -2)}
        </strong>
      );
    } else if (token.startsWith("*")) {
      nodes.push(
        <em key={`${match.index}-em`} className="text-slate-800">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith("`")) {
      nodes.push(
        <code
          key={`${match.index}-code`}
          className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[0.92em] font-medium text-slate-900"
        >
          {token.slice(1, -1)}
        </code>
      );
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
      const label = linkMatch?.[1] || token;
      const href = linkMatch?.[2] || "";

      nodes.push(
        isSafeUrl(href) ? (
          <a
            key={`${match.index}-link`}
            href={href}
            className="font-medium text-slate-950 underline decoration-primary decoration-2 underline-offset-4 hover:text-slate-700"
            target={href.startsWith("http") ? "_blank" : undefined}
            rel={href.startsWith("http") ? "noreferrer" : undefined}
          >
            {label}
          </a>
        ) : (
          label
        )
      );
    }

    lastIndex = match.index + token.length;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}

type ArticleBlock =
  | { type: "heading"; level: 2 | 3 | 4; text: string }
  | { type: "paragraph"; text: string }
  | { type: "quote"; text: string }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "image"; src: string; alt: string; caption?: string };

function parseImageLine(line: string) {
  const match = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
  if (!match) return null;

  const alt = match[1].trim();
  const target = match[2].trim();
  const targetMatch = target.match(/^(\S+)(?:\s+"([^"]+)")?$/);
  const src = targetMatch?.[1] || target;
  const caption = targetMatch?.[2];

  if (!isSafeUrl(src)) return null;
  return { src, alt, caption };
}

function isAutomaticHeading(text: string) {
  const value = text.trim();
  if (!value) return false;
  if (value.length > 90) return false;
  if (/[.!?]$/.test(value)) return false;
  if (/[,;]/.test(value)) return false;

  const words = value.replace(/[:\-]$/, "").split(/\s+/).filter(Boolean);
  if (words.length < 1 || words.length > 10) return false;

  const letters = value.replace(/[^A-Za-z]/g, "");
  const upperLetters = value.replace(/[^A-Z]/g, "");
  const isMostlyUppercase = letters.length >= 4 && upperLetters.length / letters.length > 0.75;
  const titleCaseWords = words.filter((word) => /^[A-Z0-9]/.test(word));
  const isMostlyTitleCase = titleCaseWords.length / words.length >= 0.65;
  const endsLikeHeading = /[:\-]$/.test(value);

  return isMostlyUppercase || isMostlyTitleCase || endsLikeHeading;
}

function normalizeHeadingText(text: string) {
  return text.trim().replace(/[:\-]\s*$/, "");
}

function parseArticleContent(content: string): ArticleBlock[] {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ArticleBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index].trim();

    if (!line) {
      index += 1;
      continue;
    }

    const image = parseImageLine(line);
    if (image) {
      blocks.push({ type: "image", ...image });
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{2,4})\s+(.+)$/);
    if (heading) {
      blocks.push({
        type: "heading",
        level: heading[1].length as 2 | 3 | 4,
        text: heading[2].trim(),
      });
      index += 1;
      continue;
    }

    if (/^>\s+/.test(line)) {
      const quoteLines: string[] = [];
      while (index < lines.length && /^>\s+/.test(lines[index].trim())) {
        quoteLines.push(lines[index].trim().replace(/^>\s+/, ""));
        index += 1;
      }
      blocks.push({ type: "quote", text: quoteLines.join(" ") });
      continue;
    }

    if (/^[-*]\s+/.test(line) || /^\d+\.\s+/.test(line)) {
      const ordered = /^\d+\.\s+/.test(line);
      const items: string[] = [];
      const itemPattern = ordered ? /^\d+\.\s+/ : /^[-*]\s+/;

      while (index < lines.length && itemPattern.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(itemPattern, ""));
        index += 1;
      }

      blocks.push({ type: "list", ordered, items });
      continue;
    }

    const paragraphLines: string[] = [];
    while (index < lines.length) {
      const current = lines[index].trim();
      if (
        !current ||
        parseImageLine(current) ||
        /^(#{2,4})\s+/.test(current) ||
        /^>\s+/.test(current) ||
        /^[-*]\s+/.test(current) ||
        /^\d+\.\s+/.test(current)
      ) {
        break;
      }
      paragraphLines.push(current);
      index += 1;
    }

    const paragraphText = paragraphLines.join(" ");

    if (paragraphLines.length === 1 && isAutomaticHeading(paragraphText)) {
      blocks.push({
        type: "heading",
        level: 2,
        text: normalizeHeadingText(paragraphText),
      });
    } else {
      blocks.push({ type: "paragraph", text: paragraphText });
    }
  }

  return blocks;
}

function ArticleContent({ content }: { content: string }) {
  const blocks = parseArticleContent(content);

  return (
    <div className="space-y-7">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          const HeadingTag = `h${block.level}` as keyof JSX.IntrinsicElements;
          const className =
            block.level === 2
              ? "pt-6 text-3xl font-bold leading-tight text-slate-950"
              : block.level === 3
                ? "pt-4 text-2xl font-bold leading-tight text-slate-950"
                : "pt-2 text-xl font-semibold leading-tight text-slate-900";

          return (
            <HeadingTag key={index} className={className}>
              {parseInline(block.text)}
            </HeadingTag>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={index}
              className="border-l-4 border-primary bg-amber-50/70 px-5 py-4 text-lg font-medium leading-8 text-slate-900"
            >
              {parseInline(block.text)}
            </blockquote>
          );
        }

        if (block.type === "list") {
          const ListTag = block.ordered ? "ol" : "ul";
          return (
            <ListTag
              key={index}
              className={
                block.ordered
                  ? "space-y-3 pl-6 text-lg leading-8 text-slate-700 list-decimal marker:font-semibold marker:text-slate-950"
                  : "space-y-3 pl-6 text-lg leading-8 text-slate-700 list-disc marker:text-primary"
              }
            >
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{parseInline(item)}</li>
              ))}
            </ListTag>
          );
        }

        if (block.type === "image") {
          const src = getImageSrc(block.src);
          return (
            <figure key={index} className="mx-auto max-w-2xl py-4">
              <div className="flex max-h-[360px] items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50 shadow-sm">
                <img
                  src={src}
                  alt={block.alt}
                  className="max-h-[360px] w-full object-contain"
                  loading="lazy"
                />
              </div>
              {block.caption ? (
                <figcaption className="mt-3 text-center text-sm leading-6 text-slate-500">
                  {block.caption}
                </figcaption>
              ) : null}
            </figure>
          );
        }

        return (
          <p key={index} className="text-lg leading-8 text-slate-700">
            {parseInline(block.text)}
          </p>
        );
      })}
    </div>
  );
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
  const readTime = estimateReadTime(blog.content);
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
    <div className="min-h-screen bg-slate-50">
      <Script
        id="blog-json-ld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />
      <main>
        <article className="overflow-hidden">
          {image ? (
            <section className="bg-white">
              <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
                <Link
                  href="/blogs"
                  className="mb-5 inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-950"
                >
                  &larr; Back to blogs
                </Link>
                <figure className="relative overflow-hidden rounded-lg bg-slate-950 shadow-soft">
                  <img
                    src={image}
                    alt={blog.coverImageAlt || blog.title}
                    className="h-[330px] w-full object-cover sm:h-[420px] lg:h-[480px]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 px-5 pb-6 pt-16 text-white backdrop-blur-[2px] sm:px-8 sm:pb-8 lg:px-10">
                    <h1 className="mx-auto max-w-4xl text-center text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
                      {blog.title}
                    </h1>
                    <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                      <span className="rounded-md bg-white/18 px-3 py-1.5 text-sm font-semibold ring-1 ring-white/20">
                        {blog.category || "Education"}
                      </span>
                      <span className="rounded-md bg-white/18 px-3 py-1.5 text-sm font-semibold ring-1 ring-white/20">
                        {formatDate(blog.publishedAt || blog.createdAt)}
                      </span>
                    </div>
                  </div>
                </figure>
              </div>
            </section>
          ) : (
            <section className="border-b border-slate-200 bg-white">
              <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
                <Link
                  href="/blogs"
                  className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-slate-950"
                >
                  &larr; Back to blogs
                </Link>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Badge className="bg-primary/15 text-slate-900 border-primary/20">
                    {blog.category || "Education"}
                  </Badge>
                  <span className="text-sm font-medium text-slate-500">
                    {formatDate(blog.publishedAt || blog.createdAt)}
                  </span>
                  <span className="h-1 w-1 rounded-full bg-slate-300" />
                  <span className="text-sm font-medium text-slate-500">
                    {readTime} min read
                  </span>
                </div>
                <h1 className="mt-5 max-w-4xl text-4xl font-bold leading-tight text-slate-950 sm:text-5xl">
                  {blog.title}
                </h1>
              </div>
            </section>
          )}

          <section className="border-b border-slate-200 bg-white">
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
              <p className="max-w-4xl text-xl leading-8 text-slate-600">
                {blog.excerpt}
              </p>
              <p className="mt-5 text-sm font-semibold text-slate-700">
                By <span className="text-slate-950">{blog.authorName || "TuitionsTime Team"}</span>
              </p>
            </div>
          </section>

          <section className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
            <div className="rounded-lg border border-slate-200 bg-white px-5 py-8 shadow-sm sm:px-8 lg:px-10">
              <ArticleContent content={blog.content} />
            </div>

            <aside className="mt-8 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
              <div>
                <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Article
                </p>
                <dl className="mt-4 grid gap-4 text-center text-sm sm:grid-cols-3">
                  <div>
                    <dt className="font-medium text-slate-500">Author</dt>
                    <dd className="mt-1 font-semibold text-slate-950">
                      {blog.authorName || "TuitionsTime Team"}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Published</dt>
                    <dd className="mt-1 font-semibold text-slate-950">
                      {formatDate(blog.publishedAt || blog.createdAt)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-medium text-slate-500">Reading time</dt>
                    <dd className="mt-1 font-semibold text-slate-950">
                      {readTime} min read
                    </dd>
                  </div>
                </dl>
              </div>

              {blog.tags && blog.tags.length > 0 ? (
                <div className="mt-6 border-t border-slate-200 pt-5">
                  <p className="text-center text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Topics
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {blog.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="border-slate-200 text-slate-600">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>
          </section>
        </article>
      </main>
      <Footer />
    </div>
  );
}
