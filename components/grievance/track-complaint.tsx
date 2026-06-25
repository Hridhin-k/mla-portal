"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { Search, CheckCircle2, Circle } from "lucide-react";
import { FadeIn } from "@/components/animations/motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import type { Complaint, ComplaintStatus } from "@/types/database";

const statusOrder: ComplaintStatus[] = ["submitted", "under_review", "in_progress", "resolved"];

export function TrackComplaintClient() {
  const t = useTranslations("track");
  const tGrievance = useTranslations("grievance");
  const searchParams = useSearchParams();
  const [complaintId, setComplaintId] = useState(searchParams.get("id") ?? "");
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!complaintId.trim()) return;
    setLoading(true);
    setNotFound(false);
    try {
      const res = await fetch(`/api/complaints/track?id=${encodeURIComponent(complaintId.trim())}`);
      const data = await res.json();
      if (!res.ok) {
        setComplaint(null);
        setNotFound(true);
      } else {
        setComplaint(data);
      }
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const currentStatusIndex = complaint ? statusOrder.indexOf(complaint.status) : -1;

  return (
    <div className="pt-32 pb-24">
      <div className="mx-auto max-w-3xl px-6 lg:px-8">
        <FadeIn className="text-center mb-12">
          <h1 className="font-display text-5xl font-medium text-charcoal mb-4">{t("title")}</h1>
          <p className="text-muted">{t("subtitle")}</p>
        </FadeIn>

        <FadeIn delay={0.1} className="flex gap-3 mb-12">
          <Input
            placeholder={t("placeholder")}
            value={complaintId}
            onChange={(e) => setComplaintId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <Button variant="gold" onClick={handleSearch} disabled={loading}>
            <Search className="h-4 w-4" />
            {t("search")}
          </Button>
        </FadeIn>

        {notFound && (
          <FadeIn className="text-center text-muted py-8">{t("notFound")}</FadeIn>
        )}

        {complaint && (
          <FadeIn>
            <div className="glass-card rounded-2xl p-8 mb-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-sm text-muted">{complaint.complaint_id}</p>
                  <h2 className="font-display text-2xl text-charcoal mt-1">{t("details")}</h2>
                </div>
                <span className="bg-emerald/10 text-emerald text-sm px-3 py-1 rounded-full">
                  {t(`statuses.${complaint.status}`)}
                </span>
              </div>
              <div className="grid sm:grid-cols-2 gap-4 text-sm">
                <div><span className="text-muted">Category:</span> {tGrievance(`categories.${complaint.category}`)}</div>
                <div><span className="text-muted">Submitted:</span> {formatDate(complaint.created_at)}</div>
                <div className="sm:col-span-2"><span className="text-muted">Description:</span> {complaint.description}</div>
              </div>
            </div>

            <h3 className="font-display text-xl mb-6">{t("timeline")}</h3>
            <div className="space-y-0">
              {statusOrder.map((status, i) => {
                const isComplete = i <= currentStatusIndex;
                const isCurrent = i === currentStatusIndex;
                return (
                  <div key={status} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      {isComplete ? (
                        <CheckCircle2 className={`h-6 w-6 ${isCurrent ? "text-emerald" : "text-gold"}`} />
                      ) : (
                        <Circle className="h-6 w-6 text-border" />
                      )}
                      {i < statusOrder.length - 1 && (
                        <div className={`w-px h-12 ${isComplete ? "bg-gold" : "bg-border"}`} />
                      )}
                    </div>
                    <div className="pb-8">
                      <p className={`font-medium ${isCurrent ? "text-emerald" : isComplete ? "text-charcoal" : "text-muted"}`}>
                        {t(`statuses.${status}`)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </FadeIn>
        )}
      </div>
    </div>
  );
}
