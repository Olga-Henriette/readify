import { db } from "@/lib/db";
import { reservations, users } from "@/lib/db/schema";
import { eq, lt, and, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  
  try {
    const now = new Date();

    // 1. Trouver les réservations PENDING qui ont expiré
    const expired = await db
      .select()
      .from(reservations)
      .where(
        and(
          eq(reservations.status, "PENDING"),
          lt(reservations.expiresAt, now)
        )
      );

    for (const res of expired) {
      await db.transaction(async (tx) => {
        // A. Marquer la réservation comme CANCELLED
        await tx.update(reservations)
          .set({ status: "CANCELLED" })
          .where(eq(reservations.id, res.id));

        // B. Incrémenter le compteur d'annulation de l'utilisateur
        const [userData] = await tx.update(users)
          .set({ cancellationCount: sql`${users.cancellationCount} + 1` })
          .where(eq(users.id, res.userId))
          .returning();

        // C. Sanction : Si 3 annulations -> Banni 1 an
        if (userData.cancellationCount >= 3) {
          const nextYear = new Date();
          nextYear.setFullYear(nextYear.getFullYear() + 1);
          
          await tx.update(users)
            .set({ 
              bannedFromReservingUntil: nextYear,
              cancellationCount: 0 // Reset après la sentence
            })
            .where(eq(users.id, res.userId));
        }
      });
    }

    return NextResponse.json({ processed: expired.length });
  } catch (error) {
    return NextResponse.json({ error: "Calcul de maintenance échoué" }, { status: 500 });
  }
}