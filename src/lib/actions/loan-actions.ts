"use server";

import { db } from "@/lib/db";
import { books, borrowings, users } from "@/lib/db/schema";
import { eq, and, isNull, lt, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function borrowBook(bookId: string, userId: string) {
  try {
    return await db.transaction(async (tx) => {
      // --- VÉRIFICATION SUSPENSION ---
      const [user] = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
      if (user?.suspendedUntil && user.suspendedUntil > new Date()) {
        throw new Error(`COMPTE SUSPENDU : Vous ne pouvez pas emprunter de livre jusqu'au ${user.suspendedUntil.toLocaleDateString()}`);
      }

      // --- 1. VÉRIFICATION DES LIVRES EN RETARD  ---
      const overdueLoans = await tx
        .select()
        .from(borrowings)
        .where(
          and(
            eq(borrowings.userId, userId),
            isNull(borrowings.returnedAt),
            lt(borrowings.dueDate, new Date()) // Date d'échéance < Aujourd'hui
          )
        );

      if (overdueLoans.length > 0) {
        throw new Error("ACCÈS BLOQUÉ : Vous avez des livres non rendus hors délai. Rendez-les pour débloquer votre compte.");
      }

      // --- 2. VÉRIFICATION DU NOMBRE TOTAL (Limite de 3) ---
      const [currentLoansCount] = await tx
        .select({ value: count() })
        .from(borrowings)
        .where(and(eq(borrowings.userId, userId), isNull(borrowings.returnedAt)));

      if (currentLoansCount.value >= 3) {
        throw new Error("LIMITE ATTEINTE : Vous ne pouvez pas emprunter plus de 3 livres simultanément.");
      }

      // --- 3. VÉRIFICATION DES DOUBLONS ---
      const existingLoan = await tx
        .select()
        .from(borrowings)
        .where(
          and(
            eq(borrowings.userId, userId),
            eq(borrowings.bookId, bookId),
            isNull(borrowings.returnedAt)
          )
        );

      if (existingLoan.length > 0) {
        throw new Error("DÉJÀ EN POSSESSION : Vous avez déjà un exemplaire de ce livre en cours d'emprunt.");
      }

      // --- 4. VÉRIFICATION DISPONIBILITÉ ET MISE À JOUR ---
      const [book] = await tx.select().from(books).where(eq(books.id, bookId)).limit(1);
      if (!book || book.availableStock <= 0) {
        throw new Error("INDISPONIBLE : Ce livre n'est plus en rayon.");
      }

      await tx.insert(borrowings).values({
        bookId,
        userId,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      });

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

export async function returnBook(borrowingId: string) {
  return await db.transaction(async (tx) => {
    // 1. Récupérer l'emprunt
    const [loan] = await tx.select().from(borrowings).where(eq(borrowings.id, borrowingId)).limit(1);
    if (!loan) throw new Error("Emprunt introuvable");

    // 2. Marquer comme rendu
    await tx.update(borrowings)
      .set({ returnedAt: new Date() })
      .where(eq(borrowings.id, borrowingId));

    // 3. Remettre le livre en stock
    const [book] = await tx.select().from(books).where(eq(books.id, loan.bookId)).limit(1);
    await tx.update(books)
      .set({ availableStock: book.availableStock + 1 })
      .where(eq(books.id, loan.bookId));

    // 4. Remise à zéro de l'utilisateur 
    await tx.update(users)
      .set({ 
        fineBalance: 0, 
        suspendedUntil: null 
      })
      .where(eq(users.id, loan.userId));

    revalidatePath("/dashboard/admin/loans");
    revalidatePath("/dashboard/admin/users");
    return { success: true };
  });
}