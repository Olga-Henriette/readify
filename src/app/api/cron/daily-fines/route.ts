import { db } from "@/lib/db";
import { borrowings, users } from "@/lib/db/schema";
import { lt, isNull, and, sql, eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const now = new Date();

    // 1. Trouver tous les emprunts en retard (non rendus et date dépassée)
    const overdue = await db
      .select()
      .from(borrowings)
      .where(and(isNull(borrowings.returnedAt), lt(borrowings.dueDate, now)));

    for (const loan of overdue) {
      await db.transaction(async (tx) => {
        // A. Ajouter 100 centimes (1€) 
        await tx.update(users)
          .set({ 
            fineBalance: sql`${users.fineBalance} + 100`, // en centimes
            suspendedUntil: new Date(now.getTime() + 24 * 60 * 60 * 1000) 
          })
          .where(eq(users.id, loan.userId));
      });
    }

    return NextResponse.json({ updated: overdue.length, message: "Pénalités appliquées" });
  } catch (error) {
    return NextResponse.json({ error: "Erreur calcul amendes" }, { status: 500 });
  }
}