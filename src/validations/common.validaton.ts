import { z } from "zod";

export const schemaId = z.coerce
  .number({ message: "ID gereklidir" })
  .positive("ID pozitif bir sayi olmalidir");

export const createPathSchema = z.object({
  title: z.string().min(3, "En az 3 harf!"),
  description: z.string().optional(),
  categoryId: z.number().nonnegative(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
});
export const updatePathSchema = createPathSchema.partial();
