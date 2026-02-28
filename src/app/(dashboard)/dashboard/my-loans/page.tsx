import { db } from "@/lib/db";
import { borrowings, books } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { auth } from "@/lib/auth"; 
import { headers } from "next/headers";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns"; 
import { fr } from "date-fns/locale";

export default async function MyLoansPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return <div>Accès refusé</div>;

  const myLoans = await db
    .select({
      id: borrowings.id,
      dueDate: borrowings.dueDate,
      title: books.title,
    })
    .from(borrowings)
    .innerJoin(books, eq(borrowings.bookId, books.id))
    .where(and(eq(borrowings.userId, session.user.id), isNull(borrowings.returnedAt)));

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold">Mes Emprunts en cours</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {myLoans.map((loan) => {
          const isOverdue = new Date() > new Date(loan.dueDate);
          return (
            <div key={loan.id} className={`p-4 border rounded-xl shadow-sm bg-white ${isOverdue ? "border-red-500 bg-red-50" : ""}`}>
              <h3 className="font-semibold text-lg">{loan.title}</h3>
              <p className="text-sm text-muted-foreground">
                À rendre avant le : {format(new Date(loan.dueDate), "dd MMMM yyyy", { locale: fr })}
              </p>
              {isOverdue && (
                <div className="mt-2 flex flex-col gap-2">
                   <Badge variant="destructive" className="animate-pulse">⚠️ RETARD CRITIQUE</Badge>
                   <p className="text-xs text-red-600 font-medium">
                     Sanction : 1 mois de suspension et amende en cours.
                   </p>
                </div>
              )}
            </div>
          );
        })}
        {myLoans.length === 0 && <p>Vous n'avez aucun emprunt en cours.</p>}
      </div>
    </div>
  );
}