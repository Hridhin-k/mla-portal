"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Upload, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FadeIn } from "@/components/animations/motion";
import { grievanceSchema, type GrievanceFormData, complaintCategories } from "@/lib/validations/grievance";

const steps = ["citizen", "category", "description", "attachments", "review"] as const;

export function GrievanceForm() {
  const t = useTranslations("grievance");
  const [step, setStep] = useState(0);
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [complaintId, setComplaintId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<GrievanceFormData>({
    resolver: zodResolver(grievanceSchema),
    defaultValues: {
      citizen_name: "",
      phone: "",
      ward: "",
      panchayat: "",
      category: "other",
      description: "",
    },
  });

  const values = form.watch();
  const description = form.watch("description");

  const nextStep = async () => {
    const fields: Record<number, (keyof GrievanceFormData)[]> = {
      0: ["citizen_name", "phone", "ward", "panchayat"],
      1: ["category"],
      2: ["description"],
    };
    if (fields[step]) {
      const valid = await form.trigger(fields[step]);
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const formData = new FormData();
      Object.entries(values).forEach(([key, val]) => formData.append(key, val));
      files.forEach((file) => formData.append("files", file));

      const res = await fetch("/api/complaints", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");
      setComplaintId(data.complaint_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (complaintId) {
    return (
      <FadeIn className="text-center py-16">
        <div className="w-16 h-16 rounded-full bg-emerald/10 flex items-center justify-center mx-auto mb-6">
          <Check className="h-8 w-8 text-emerald" />
        </div>
        <h2 className="font-display text-3xl text-charcoal mb-4">{t("success.title")}</h2>
        <p className="text-muted mb-8">{t("success.message")}</p>
        <div className="glass-card rounded-2xl p-8 max-w-md mx-auto mb-8">
          <p className="text-sm text-muted mb-2">{t("success.complaintId")}</p>
          <p className="font-display text-2xl text-gold tracking-wider">{complaintId}</p>
          <p className="text-xs text-muted mt-4">{t("success.trackHint")}</p>
        </div>
        <Link href={`/track?id=${complaintId}`}>
          <Button variant="gold" size="lg">{t("success.trackCta")}</Button>
        </Link>
      </FadeIn>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress */}
      <div className="flex items-center justify-between mb-12">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${i <= step ? "bg-gold text-charcoal" : "bg-stone text-muted"}`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            {i < steps.length - 1 && <div className={`flex-1 h-px mx-2 ${i < step ? "bg-gold" : "bg-border"}`} />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === 0 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl mb-6">{t("steps.citizen")}</h2>
              {(["name", "phone", "ward", "panchayat"] as const).map((field) => {
                const key = field === "name" ? "citizen_name" : field;
                return (
                  <div key={field}>
                    <Label htmlFor={key}>{t(`fields.${field}`)}</Label>
                    <Input id={key} {...form.register(key as keyof GrievanceFormData)} className="mt-2" />
                    {form.formState.errors[key as keyof GrievanceFormData] && (
                      <p className="text-destructive text-sm mt-1">{form.formState.errors[key as keyof GrievanceFormData]?.message}</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl mb-6">{t("steps.category")}</h2>
              <Label>{t("fields.category")}</Label>
              <Select value={values.category} onValueChange={(v) => form.setValue("category", v as GrievanceFormData["category"])}>
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {complaintCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{t(`categories.${cat}`)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl mb-6">{t("steps.description")}</h2>
              <Label>{t("fields.description")}</Label>
              <Textarea {...form.register("description")} className="mt-2 min-h-[200px]" />
              <p className="text-sm text-muted">{t("charCount", { count: description.length, max: 2000 })}</p>
              {form.formState.errors.description && (
                <p className="text-destructive text-sm">{form.formState.errors.description.message}</p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl mb-6">{t("steps.attachments")}</h2>
              <Label>{t("fields.attachments")}</Label>
              <p className="text-sm text-muted mb-4">{t("fields.attachmentsHint")}</p>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-border rounded-2xl p-12 cursor-pointer hover:border-gold transition-colors">
                <Upload className="h-8 w-8 text-muted mb-4" />
                <span className="text-sm text-muted">Click to upload files</span>
                <input
                  type="file"
                  multiple
                  accept="image/*,.pdf,.doc,.docx"
                  className="hidden"
                  onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
                />
              </label>
              {files.length > 0 && (
                <ul className="space-y-2">
                  {files.map((f, i) => (
                    <li key={i} className="text-sm text-charcoal flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald" /> {f.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h2 className="font-display text-2xl mb-6">{t("reviewTitle")}</h2>
              <div className="glass-card rounded-2xl p-6 space-y-4">
                {Object.entries({
                  [t("fields.name")]: values.citizen_name,
                  [t("fields.phone")]: values.phone,
                  [t("fields.ward")]: values.ward,
                  [t("fields.panchayat")]: values.panchayat,
                  [t("fields.category")]: t(`categories.${values.category}`),
                }).map(([label, val]) => (
                  <div key={label} className="flex justify-between border-b border-border pb-3">
                    <span className="text-muted text-sm">{label}</span>
                    <span className="text-charcoal text-sm font-medium">{val}</span>
                  </div>
                ))}
                <div>
                  <span className="text-muted text-sm">{t("fields.description")}</span>
                  <p className="text-charcoal mt-2 text-sm">{values.description}</p>
                </div>
                {files.length > 0 && (
                  <p className="text-sm text-muted">{files.length} file(s) attached</p>
                )}
              </div>
              {error && <p className="text-destructive text-sm">{error}</p>}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between mt-10">
        {step > 0 ? (
          <Button variant="outline" onClick={prevStep}>
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
        ) : <div />}
        {step < steps.length - 1 ? (
          <Button variant="gold" onClick={nextStep}>
            Next <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="gold" onClick={handleSubmit} disabled={submitting}>
            {submitting ? "..." : t("submitComplaint")}
          </Button>
        )}
      </div>
    </div>
  );
}
