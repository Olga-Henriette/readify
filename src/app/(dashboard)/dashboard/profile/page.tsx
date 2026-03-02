import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertCircle, CreditCard, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { borrowings } from "@/lib/db/schema";
import { and, isNull, lt } from "drizzle-orm";

export default async function ProfilePage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const [user] = await db.select().from(users).where(eq(users.id, session.user.id)).limit(1);

  // Chercher les emprunts en retard non encore traités par le cron
  const overdueLoans = await db
    .select()
    .from(borrowings)
    .where(and(
      eq(borrowings.userId, user.id),
      isNull(borrowings.returnedAt),
      lt(borrowings.dueDate, new Date())
    ));

  // Calcul du solde réel (Base DB + Retards en cours)
  let liveFine = user.fineBalance;
  overdueLoans.forEach(loan => {
    const diffDays = Math.ceil(Math.abs(new Date().getTime() - new Date(loan.dueDate).getTime()) / (1000 * 60 * 60 * 24));
    liveFine += (diffDays * 100);
  });

  const isSuspended = (user.suspendedUntil && user.suspendedUntil > new Date()) || overdueLoans.length > 0;
  const isBannedFromReserving = user.bannedFromReservingUntil && user.bannedFromReservingUntil > new Date();

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mon Profil</h1>
          <p className="text-muted-foreground">Gérez votre compte et votre réputation.</p>
        </div>
        <Badge variant={isSuspended ? "destructive" : "outline"} className="px-4 py-1">
          {isSuspended ? "Compte Suspendu" : "Membre Actif"}
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Card: Amende */}
        <Card className={user.fineBalance > 0 ? "border-red-200 bg-red-50/30" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde des amendes</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(liveFine/ 100).toFixed(2)} €</div>
            <p className="text-xs text-muted-foreground mt-1">
              {user.fineBalance > 0 
                ? "Régularisez votre solde pour lever les restrictions." 
                : "Aucune amende en attente."}
            </p>
            {user.fineBalance > 0 && (
              <Button className="w-full mt-4 bg-red-600 hover:bg-red-700">Payer maintenant</Button>
            )}
          </CardContent>
        </Card>

        {/* Card: Réputation Réservations */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fiabilité Réservations</CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between text-xs">
              <span>Annulations ({user.cancellationCount}/3)</span>
              <span className="font-bold">{3 - user.cancellationCount} chances restantes</span>
            </div>
            <Progress value={(user.cancellationCount / 3) * 100} className="h-2" />
            {isBannedFromReserving && (
              <div className="flex items-start gap-2 text-xs text-destructive font-medium">
                <AlertCircle className="h-3 w-3 mt-0.5" />
                <span>Réservations bloquées jusqu'au {user.bannedFromReservingUntil?.toLocaleDateString()}</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}