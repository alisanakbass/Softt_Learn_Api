import { email, z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Gecerli email giriniz"),
  password: z.string().min(6, "Sifre en az 6 karakter olmali"),
  name: z.string().min(2, "Adiniz en az 2 karakter olmali"),
});

export const loginSchema = z.object({
  email: z
    .string()
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Gecerli email giriniz"),
  passeord: z.string(),
});
