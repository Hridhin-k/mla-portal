import Image from "next/image";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getNewsBySlug, getNews } from "@/lib/data/queries";

export async function generateStaticParams() {
  const news = await getNews();
  return news.map((n) => ({ slug: n.slug }));
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  const title = locale === "ml" && article.title_ml ? article.title_ml : article.title;
  const content = locale === "ml" && article.content_ml ? article.content_ml : article.content;

  return (
    <article className="pt-32 pb-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <Link href="/news" className="inline-flex items-center gap-2 text-gold hover:text-brass mb-8 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to News
        </Link>
        {article.published_at && (
          <time className="text-sm text-muted">{formatDate(article.published_at, locale)}</time>
        )}
        <h1 className="font-display text-4xl md:text-5xl font-medium text-charcoal mt-4 mb-8">{title}</h1>
        {article.featured_image && (
          <div className="relative aspect-[16/9] rounded-2xl overflow-hidden mb-12">
            <Image src={article.featured_image} alt={title} fill className="object-cover" priority />
          </div>
        )}
        <div className="prose prose-lg max-w-none text-charcoal/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </article>
  );
}
