"use client";

import { CircleHelp, Map } from "lucide-react";
import { DialogRoot, DialogContent } from "@/components/admin/dialog";
import { AdminButton } from "@/components/admin/ui";
import { getHelpSections } from "@/lib/admin/help-content";

export function AdminHelpPanel({
  open,
  onOpenChange,
  isAdmin,
  onStartTour,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isAdmin: boolean;
  onStartTour: () => void;
}) {
  const sections = getHelpSections(isAdmin);

  const handleStartTour = () => {
    onOpenChange(false);
    window.setTimeout(() => onStartTour(), 200);
  };

  return (
    <DialogRoot open={open} onOpenChange={onOpenChange}>
      <DialogContent
        title="Admin Help Guide"
        description="How to use the constituency administration portal."
        className="max-w-2xl"
      >
        <div className="mb-6 flex flex-wrap gap-3">
          <AdminButton type="button" onClick={handleStartTour}>
            <Map className="h-4 w-4" />
            Take the tour again
          </AdminButton>
        </div>

        <div className="space-y-4 max-h-[min(60vh,520px)] overflow-y-auto admin-scrollbar pr-1">
          {sections.map((section) => (
            <section
              key={section.id}
              className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-navy-soft)]/40 p-4"
            >
              <h3 className="text-sm font-semibold text-[var(--admin-navy)] flex items-center gap-2">
                <CircleHelp className="h-4 w-4 text-[var(--admin-saffron)] shrink-0" />
                {section.title}
              </h3>
              <ul className="mt-3 space-y-2">
                {section.body.map((line, i) => (
                  <li key={i} className="text-sm text-[var(--admin-muted)] leading-relaxed pl-1">
                    {line}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </DialogContent>
    </DialogRoot>
  );
}
