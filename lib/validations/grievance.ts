import { z } from "zod";

export const grievanceSchema = z.object({
  citizen_name: z.string().min(2, "Name is required"),
  phone: z.string().min(10, "Valid phone number required"),
  ward: z.string().min(1, "Ward is required"),
  panchayat: z.string().min(1, "Panchayat is required"),
  category: z.enum([
    "drinking_water",
    "roads",
    "pension",
    "healthcare",
    "education",
    "infrastructure",
    "other",
  ]),
  description: z.string().min(20, "Please provide at least 20 characters").max(2000),
});

export type GrievanceFormData = z.infer<typeof grievanceSchema>;

export const complaintCategories = [
  "drinking_water",
  "roads",
  "pension",
  "healthcare",
  "education",
  "infrastructure",
  "other",
] as const;
