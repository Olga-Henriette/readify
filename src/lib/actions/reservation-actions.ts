"use server";

import { db } from "@/lib/db";
import { books, borrowings, reservations, users } from "@/lib/db/schema";
import { eq, and, isNull, asc, count, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function reserveBook(bookId: string, userId: string) {
  return await db.transaction(async (tx) => {

    // --- VÉRIFICATION SUSPENSION ---
    const [user] = await tx.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user?.suspendedUntil && user.suspendedUntil > new Date()) {
      throw new Error("ACTION INTERDITE : Votre compte est actuellement suspendu.");
    }

    const existingSameBook = await tx
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.userId, userId),
          eq(reservations.bookId, bookId),
          eq(reservations.status, "PENDING")
        )
      );

    if (existingSameBook.length > 0) {
      throw new Error("Vous avez déjà une réservation en attente pour cet ouvrage.");
    }

    const activeResCount = await tx
      .select({ value: count() })
      .from(reservations)
      .where(
        and(
          eq(reservations.userId, userId),
          eq(reservations.status, "PENDING")
        )
      );

    if (activeResCount[0].value >= 2) {
      throw new Error("Limite atteinte : Vous ne pouvez pas avoir plus de 2 réservations simultanées.");
    }

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


    // Vérifier si le livre est déjà en stock (on ne réserve pas ce qui est dispo)
    const [book] = await tx.select().from(books).where(eq(books.id, bookId)).limit(1);
    if (book && book.availableStock > 0) {
      throw new Error("Le livre est disponible en rayon, vous pouvez l'emprunter directement.");
    }

    // Calculer la date de disponibilité estimée
    // Prend l'emprunt non rendu du livre qui a la date de retour la plus proche
    const [earliestReturn] = await tx
      .select()
      .from(borrowings)
      .where(and(eq(borrowings.bookId, bookId), isNull(borrowings.returnedAt)))
      .orderBy(asc(borrowings.dueDate))
      .limit(1);

    const availableDate = earliestReturn ? new Date(earliestReturn.dueDate) : new Date();
    
    // Créer la réservation
    await tx.insert(reservations).values({
      bookId,
      userId,
      availableAt: availableDate,
      expiresAt: new Date(availableDate.getTime() + 2 * 24 * 60 * 60 * 1000),
      status: "PENDING"
    });

    revalidatePath("/dashboard/my-reservations");
    revalidatePath("/dashboard/books");
    return { success: true };
  });
}

export async function cancelReservation(reservationId: string) {
  return await db.transaction(async (tx) => {
    // 1. Récupérer la réservation pour avoir l'ID de l'utilisateur
    const [res] = await tx.select().from(reservations).where(eq(reservations.id, reservationId)).limit(1);
    if (!res) throw new Error("Réservation introuvable");

    // 2. Marquer comme annulée
    await tx.update(reservations)
      .set({ status: "CANCELLED" })
      .where(eq(reservations.id, reservationId));

    // 3. Incrémenter le compteur de l'utilisateur et gérer la suspension
    const [userData] = await tx.update(users)
      .set({ cancellationCount: sql`${users.cancellationCount} + 1` })
      .where(eq(users.id, res.userId))
      .returning();

    // Si 3 annulations -> Suspension automatique d'un mois 
    if (userData.cancellationCount >= 3) {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      
      await tx.update(users)
        .set({ 
          suspendedUntil: nextMonth,
          cancellationCount: 0 // Reset après la sanction
        })
        .where(eq(users.id, res.userId));
    }

    revalidatePath("/dashboard/my-reservations");
    revalidatePath("/dashboard/admin/users");
    return { success: true };
  });
}