"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { MapPin, Phone, Mail } from "lucide-react";
import type { SiteSettings } from "@/types/database";

const footerLinks = [
  { key: "home", href: "/" },
  { key: "projects", href: "/projects" },
  { key: "news", href: "/news" },
  { key: "grievance", href: "/grievance" },
  { key: "track", href: "/track" },
  { key: "contact", href: "/contact" },
] as const;

export function Footer({ settings }: { settings: SiteSettings }) {
  const t = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="border-t border-border bg-charcoal text-ivory">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <h3 className="font-display text-2xl font-medium mb-4">MLA Portal</h3>
            <p className="text-ivory/70 text-sm leading-relaxed max-w-xs">{t("tagline")}</p>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-gold mb-6">{t("quickLinks")}</h4>
            <nav className="flex flex-col gap-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.key}
                  href={link.href}
                  className="text-sm text-ivory/70 hover:text-gold transition-colors"
                >
                  {tNav(link.key)}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-[0.2em] text-gold mb-6">{t("contact")}</h4>
            <div className="flex flex-col gap-4 text-sm text-ivory/70">
              <div className="flex items-start gap-3">
                <MapPin className="h-4 w-4 mt-0.5 text-gold shrink-0" />
                <span>{settings.office_address}</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gold shrink-0" />
                <a href={`tel:${settings.office_phone}`} className="hover:text-gold transition-colors">
                  {settings.office_phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gold shrink-0" />
                <a href={`mailto:${settings.office_email}`} className="hover:text-gold transition-colors">
                  {settings.office_email}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="gold-line my-10" />
        <p className="text-center text-xs text-ivory/50">
          © {new Date().getFullYear()} {settings.constituency}. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
