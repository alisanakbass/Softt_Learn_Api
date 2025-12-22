import { z } from "zod";

export const schemaId = z.coerce
  .number({ message: "ID gereklidir" })
  .positive("ID pozitif bir sayi olmalidir");
