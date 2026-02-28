import { z } from "zod";

export const bookSchema = z.object({
  title: z.string().min(1, "Le titre est requis").max(255),
  author: z.string().min(1, "L'auteur est requis"),
  isbn: z.string().min(10, "ISBN invalide"),
  stock: z.number({ error: "Veuillez entrer un nombre valide" })
         .min(0, "Le stock ne peut pas être négatif"),
});

export type BookFormValues = z.infer<typeof bookSchema>;