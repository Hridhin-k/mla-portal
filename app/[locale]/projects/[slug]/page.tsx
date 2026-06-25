import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/routing";
import { ArrowLeft } from "lucide-react";
import { FadeIn } from "@/components/animations/motion";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import { getProjectBySlug, getProjects } from "@/lib/data/queries";

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("projects");
  const tCommon = await getTranslations("common");
  const project = await getProjectBySlug(slug);
  if (!project) notFound();

  const related = (await getProjects({ category: project.category })).filter((p) => p.id !== project.id).slice(0, 3);
  const title = locale === "ml" && project.title_ml ? project.title_ml : project.title;
  const description = locale === "ml" && project.description_ml ? project.description_ml : project.description;

  return (
    <div className="pt-20">
      <div className="relative h-[50vh] md:h-[60vh]">
        {project.featured_image && (
          <Image src={project.featured_image} alt={title} fill className="object-cover" priority />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-16">
          <div className="mx-auto max-w-7xl">
            <span className="text-gold text-sm uppercase tracking-wider">{t(`categories.${project.category}`)}</span>
            <h1 className="font-display text-4xl md:text-6xl text-ivory mt-2">{title}</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <Link href="/projects" className="inline-flex items-center gap-2 text-gold hover:text-brass mb-12 text-sm">
          <ArrowLeft className="h-4 w-4" /> Back to Projects
        </Link>

        <div className="grid lg:grid-cols-3 gap-12">
          <FadeIn className="lg:col-span-2">
            <div className="prose prose-lg max-w-none text-charcoal/80 leading-relaxed mb-12">
              <p>{description}</p>
            </div>

            {project.before_image && project.after_image && (
              <div className="mb-12">
                <h2 className="font-display text-2xl mb-6">{t("beforeAfter")}</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="relative aspect-video rounded-xl overflow-hidden">
                    <Image src={project.before_image} alt="Before" fill className="object-cover" />
                    <span className="absolute bottom-4 left-4 bg-charcoal/80 text-ivory text-xs px-3 py-1 rounded-full">Before</span>
                  </div>
                  <div className="relative aspect-video rounded-xl overflow-hidden">
                    <Image src={project.after_image} alt="After" fill className="object-cover" />
                    <span className="absolute bottom-4 left-4 bg-emerald/80 text-ivory text-xs px-3 py-1 rounded-full">After</span>
                  </div>
                </div>
              </div>
            )}
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="glass-card rounded-2xl p-8 space-y-6 sticky top-28">
              <div>
                <p className="text-xs uppercase tracking-wider text-gold mb-1">{tCommon("status")}</p>
                <p className="font-medium">{t(`statuses.${project.status}`)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-gold mb-2">{tCommon("progress")}</p>
                <Progress value={project.progress} />
                <p className="text-sm text-emerald mt-1">{project.progress}%</p>
              </div>
              {project.location && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gold mb-1">{tCommon("location")}</p>
                  <p>{project.location}</p>
                </div>
              )}
              {project.budget && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gold mb-1">Budget</p>
                  <p>{project.budget}</p>
                </div>
              )}
              {project.start_date && (
                <div>
                  <p className="text-xs uppercase tracking-wider text-gold mb-1">{t("timeline")}</p>
                  <p className="text-sm">
                    {formatDate(project.start_date, locale)}
                    {project.end_date && ` — ${formatDate(project.end_date, locale)}`}
                  </p>
                </div>
              )}
            </div>
          </FadeIn>
        </div>

        {related.length > 0 && (
          <FadeIn className="mt-20">
            <h2 className="font-display text-3xl mb-8">{t("related")}</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link key={p.id} href={`/projects/${p.slug}`} className="group">
                  <div className="relative aspect-video rounded-xl overflow-hidden mb-3">
                    {p.featured_image && <Image src={p.featured_image} alt={p.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />}
                  </div>
                  <h3 className="font-display text-lg group-hover:text-gold transition-colors">{p.title}</h3>
                </Link>
              ))}
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
