"use server";

import { db } from "@/lib/db";
import { books, borrowings, reservations, users } from "@/lib/db/schema";
import { eq, and, isNull, asc, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function reserveBook(bookId: string, userId: string) {
  return await db.transaction(async (tx) => {
    // --- L'utilisateur a-t-il déjà ce livre en main ? ---
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
      throw new Error("DÉNI : Vous possédez déjà ce livre. Rendez-le avant de pouvoir le réserver à nouveau.");
    }

    // 1. Vérifier si l'utilisateur est banni des réservations
    const [user] = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user?.bannedFromReservingUntil && user.bannedFromReservingUntil > new Date()) {
      throw new Error(`Réservations bloquées jusqu'au ${user.bannedFromReservingUntil.toLocaleDateString()}`);
    }

    // 2. Vérifier si le livre est déjà en stock (on ne réserve pas ce qui est dispo)
    const [book] = await tx.select().from(books).where(eq(books.id, bookId)).limit(1);
    if (book && book.availableStock > 0) {
      throw new Error("Le livre est disponible en rayon, vous pouvez l'emprunter directement.");
    }

    // 3. Calculer la date de disponibilité estimée
    // Prend l'emprunt non rendu du livre qui a la date de retour la plus proche
    const [earliestReturn] = await tx
      .select()
      .from(borrowings)
      .where(and(eq(borrowings.bookId, bookId), isNull(borrowings.returnedAt)))
      .orderBy(asc(borrowings.dueDate))
      .limit(1);

    const availableDate = earliestReturn ? new Date(earliestReturn.dueDate) : new Date();
    
    // 4. Créer la réservation
    await tx.insert(reservations).values({
      bookId,
      userId,
      availableAt: availableDate,
      // La réservation expire 48h après la date de disponibilité 
      expiresAt: new Date(availableDate.getTime() + 2 * 24 * 60 * 60 * 1000),
    });

    revalidatePath("/dashboard/books");
    return { success: true };
  });
}