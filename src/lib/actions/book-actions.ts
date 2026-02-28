"use server";

import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";
import { bookSchema, BookFormValues } from "@/lib/validations/book";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function createBook(values: BookFormValues) {
  // 1. Validation de sécurité côté serveur
  const validatedFields = bookSchema.safeParse(values);
  
  if (!validatedFields.success) {
    throw new Error("Données invalides");
  }

  // 2. Insertion en base de données
  await db.insert(books).values({
    ...validatedFields.data,
    availableStock: validatedFields.data.stock, // Au début, tout est disponible
  });

  // 3. Rafraîchir les données du catalogue sans recharger la page
  revalidatePath("/dashboard/books");
}

export async function deleteBook(id: string) {
  await db.delete(books).where(eq(books.id, id));
  revalidatePath("/dashboard/books");
}