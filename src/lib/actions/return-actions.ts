"use server";

import { db } from "@/lib/db";
import { books, borrowings, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function returnBook(borrowingId: string) {
  return await db.transaction(async (tx) => {
    // 1. Récupérer l'emprunt
    const [loan] = await tx.select().from(borrowings).where(eq(borrowings.id, borrowingId)).limit(1);
    if (!loan || loan.returnedAt) throw new Error("Emprunt invalide ou déjà rendu.");

    const today = new Date();
    const dueDate = new Date(loan.dueDate);
    let penaltyDays = 0;
    
    // Calcul du retard
    if (today > dueDate) {
      const diffTime = Math.abs(today.getTime() - dueDate.getTime());
      penaltyDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }

    // 2. Application des sanctions
    if (penaltyDays > 0) {
      const suspensionDate = new Date();
      suspensionDate.setMonth(suspensionDate.getMonth() + 1); // +1 mois de suspension

      await tx.update(users)
        .set({ 
          suspendedUntil: suspensionDate,
          // Exemple: 1€ (100 cts) par jour de retard si > 3 jours
          fineBalance: penaltyDays > 3 ? (penaltyDays * 100) : 0 
        })
        .where(eq(users.id, loan.userId));
    }

    // 3. Marquer comme rendu et remettre en stock
    await tx.update(borrowings)
      .set({ returnedAt: today })
      .where(eq(borrowings.id, borrowingId));

    await tx.update(books)
      .set({ availableStock: sql`${books.availableStock} + 1` }) // On utilise SQL pour l'incrément propre
      .where(eq(books.id, loan.bookId));

    revalidatePath("/dashboard/admin/loans");
    return { success: true, penaltyDays };
  });
  revalidatePath("/dashboard/admin/loans");
  revalidatePath("/dashboard/my-loans");
  revalidatePath("/dashboard/books");
}