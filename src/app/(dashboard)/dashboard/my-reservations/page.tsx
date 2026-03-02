import { db } from "@/lib/db";
import { reservations, books } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { CancelReservationButton } from "@/components/books/cancel-reservation-button";

export default async function MyReservationsPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  
  const myRes = await db
    .select({
      id: reservations.id,
      title: books.title,
      status: reservations.status,
      availableAt: reservations.availableAt,
      expiresAt: reservations.expiresAt,
    })
    .from(reservations)
    .innerJoin(books, eq(reservations.bookId, books.id))
    .where(and(eq(reservations.userId, session?.user.id!), eq(reservations.status, "PENDING")));

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Mes Réservations</h1>
      <div className="grid gap-4 md:grid-cols-2">
        {myRes.length === 0 ? (
          <p className="text-muted-foreground italic">Aucune réservation active.</p>
        ) : (
          myRes.map((r) => (
            <Card key={r.id} className="overflow-hidden">
                <CardContent className="p-4 flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-slate-800">{r.title}</h3>
                        <Badge variant="outline" className="mt-1 text-amber-600 border-amber-200 bg-amber-50">
                        En attente
                        </Badge>
                    </div>
                    {/* BOUTON D'ANNULATION ICI */}
                    <CancelReservationButton reservationId={r.id} />
                    </div>
                    
                    <div className="mt-2 p-3 bg-slate-50 rounded-lg space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-emerald-700 font-medium">
                        <Calendar className="h-4 w-4" />
                        Disponible vers le : {format(new Date(r.availableAt!), "dd MMMM", { locale: fr })}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 italic text-xs border-t pt-2">
                        <AlertCircle className="h-3 w-3" />
                        Expire 48h après disponibilité si non récupéré.
                    </div>
                    </div>
                </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}