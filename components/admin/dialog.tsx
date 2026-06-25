"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function DialogRoot({
  children,
  open,
  onOpenChange,
}: {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </Dialog.Root>
  );
}

export function DialogContent({
  children,
  className,
  title,
  description,
}: {
  children: React.ReactNode;
  className?: string;
  title: string;
  description?: string;
}) {
  return (
    <Dialog.Portal>
      <Dialog.Overlay className="admin-dialog-overlay" />
      <Dialog.Content
        className={cn("admin-dialog-content admin-scrollbar", className)}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="admin-tricolor sticky top-0 z-10" />
        <div className="p-6 sm:p-8">
          <div className="flex items-start justify-between mb-6 gap-4">
            <div className="min-w-0 pr-2">
              <Dialog.Title className="text-xl font-semibold text-[var(--admin-navy)]">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description className="text-sm text-[var(--admin-muted)] mt-1.5 leading-relaxed">
                  {description}
                </Dialog.Description>
              )}
            </div>
            <Dialog.Close
              aria-label="Close"
              className="p-2 rounded-lg hover:bg-[var(--admin-navy-soft)] text-[var(--admin-muted)] hover:text-[var(--admin-navy)] transition-colors shrink-0"
            >
              <X className="h-5 w-5" />
            </Dialog.Close>
          </div>
          {children}
        </div>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
