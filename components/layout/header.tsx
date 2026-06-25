"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/routing";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = ["home", "projects", "news", "gallery", "contact", "grievance", "track"] as const;
const paths: Record<string, string> = {
  home: "/",
  projects: "/projects",
  news: "/news",
  gallery: "/gallery",
  contact: "/contact",
  grievance: "/grievance",
  track: "/track",
};

export function Header() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 20);
        ticking = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);


  const isHome = pathname === "/";
  const overDarkHero = isHome && !scrolled;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-ivory/95 backdrop-blur-md shadow-sm border-b border-border/50"
          : isHome
            ? "bg-charcoal/35 backdrop-blur-md border-b border-ivory/10"
            : "bg-ivory/80 backdrop-blur-sm border-b border-border/40"
      )}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link href="/" className="group flex flex-col">
          <span
            className={cn(
              "font-display text-lg font-medium tracking-tight transition-colors group-hover:text-gold",
              overDarkHero ? "text-ivory" : "text-charcoal"
            )}
          >
            MLA Portal
          </span>
          <span
            className={cn(
              "text-[10px] uppercase tracking-[0.2em]",
              overDarkHero ? "text-ivory/70" : "text-muted"
            )}
          >
            Constituency
          </span>
        </Link>

        <nav className="hidden items-center gap-8 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item}
              href={paths[item]}
              className={cn(
                "relative text-sm font-medium transition-colors",
                pathname === paths[item]
                  ? "text-gold"
                  : overDarkHero
                    ? "text-ivory/90 hover:text-gold"
                    : "text-charcoal hover:text-gold"
              )}
            >
              {t(item)}
              {pathname === paths[item] && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute -bottom-1 left-0 right-0 h-px bg-gold"
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex items-center rounded-full border p-0.5 text-xs font-semibold tracking-wide",
              overDarkHero
                ? "border-ivory/25 bg-charcoal/30"
                : "border-border bg-stone/80"
            )}
          >
            <Link
              href={pathname}
              locale="en"
              className={cn(
                "rounded-full px-3 py-1.5 transition-colors",
                locale === "en"
                  ? overDarkHero
                    ? "bg-ivory text-charcoal shadow-sm"
                    : "bg-charcoal text-ivory shadow-sm"
                  : overDarkHero
                    ? "text-ivory/75 hover:text-ivory"
                    : "text-muted hover:text-charcoal"
              )}
            >
              EN
            </Link>
            <Link
              href={pathname}
              locale="ml"
              className={cn(
                "rounded-full px-3 py-1.5 transition-colors",
                locale === "ml"
                  ? overDarkHero
                    ? "bg-ivory text-charcoal shadow-sm"
                    : "bg-charcoal text-ivory shadow-sm"
                  : overDarkHero
                    ? "text-ivory/75 hover:text-ivory"
                    : "text-muted hover:text-charcoal"
              )}
            >
              മലയാളം
            </Link>
          </div>
          <button
            className={cn("lg:hidden p-2", overDarkHero ? "text-ivory" : "text-charcoal")}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-border bg-ivory/95 backdrop-blur-md"
          >
            <nav className="flex flex-col gap-1 p-6">
              {navItems.map((item) => (
                <Link
                  key={item}
                  href={paths[item]}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "py-3 text-base font-medium border-b border-border/50",
                    pathname === paths[item] ? "text-gold" : "text-charcoal"
                  )}
                >
                  {t(item)}
                </Link>
              ))}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
