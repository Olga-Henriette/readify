"use server";

import { db } from "@/lib/db";
import { books, borrowings } from "@/lib/db/schema"; 
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function borrowBook(bookId: string, userId: string) {
  try {
    return await db.transaction(async (tx) => {
      // 1. Vérifier la disponibilité réelle via availableStock
      const [book] = await tx.select().from(books).where(eq(books.id, bookId)).limit(1);

      if (!book || book.availableStock <= 0) {
        throw new Error("Désolé, ce livre n'est plus disponible en rayon.");
      }

      // 2. Créer l'emprunt
      await tx.insert(borrowings).values({
        bookId,
        userId,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // Retour dans 14j
      });

      // 3. Décrémenter uniquement le stock DISPONIBLE
      await tx.update(books)
        .set({ availableStock: book.availableStock - 1 })
        .where(eq(books.id, bookId));

      revalidatePath("/dashboard/books");
      return { success: true };
    });
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}