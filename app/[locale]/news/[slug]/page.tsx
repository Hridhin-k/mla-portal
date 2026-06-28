import { ContentImage } from "@/components/ui/content-image";
import { IMAGE_SIZES } from "@/lib/image-sizes";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { getNewsBySlug, getNews } from "@/lib/data/queries";

export const revalidate = 300;

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
  const t = await getTranslations("news");
  const article = await getNewsBySlug(slug);
  if (!article) notFound();

  const title = locale === "ml" && article.title_ml ? article.title_ml : article.title;
  const content = locale === "ml" && article.content_ml ? article.content_ml : article.content;

  return (
    <article className="pt-32 pb-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <Link
          href="/news"
          className="mb-8 inline-flex items-center gap-2 text-sm text-gold transition-colors hover:text-brass"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          Back to News
        </Link>

        <header className="mb-10">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-wider text-emerald">
              {t(`categories.${article.category}`)}
            </span>
            {article.published_at && (
              <>
                <span className="h-1 w-1 rounded-full bg-border" aria-hidden />
                <time className="text-sm text-muted" dateTime={article.published_at}>
                  {formatDate(article.published_at, locale)}
                </time>
              </>
            )}
          </div>
          <h1 className="font-display text-4xl font-medium leading-tight text-charcoal md:text-5xl">
            {title}
          </h1>
        </header>

        <div className="relative mb-12 aspect-[16/9] overflow-hidden rounded-2xl">
          <ContentImage
            src={article.featured_image}
            alt={title}
            className="object-cover"
            priority
            sizes={IMAGE_SIZES.article}
            placeholderLabel="News image"
          />
        </div>

        <div className="article-content" dangerouslySetInnerHTML={{ __html: content }} />
      </div>
    </article>
  );
}
