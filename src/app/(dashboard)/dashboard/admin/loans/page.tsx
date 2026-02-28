import { db } from "@/lib/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { borrowings, books, users } from "@/lib/db/schema";
import { eq, isNull } from "drizzle-orm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ReturnBookButton } from "@/components/admin/return-book-button";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { auth } from "@/lib/auth";

export default async function AdminLoansPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  // Sécurité : Si pas connecté ou si le rôle n'est pas ADMIN ou LIBRARIAN -> Redirection
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "LIBRARIAN")) {
    redirect("/dashboard"); // On renvoie vers le dashboard classique
  }
  
  const activeLoans = await db
    .select({
      id: borrowings.id,
      dueDate: borrowings.dueDate,
      userName: users.name,
      userEmail: users.email,
      bookTitle: books.title,
    })
    .from(borrowings)
    .innerJoin(books, eq(borrowings.bookId, books.id))
    .innerJoin(users, eq(borrowings.userId, users.id))
    .where(isNull(borrowings.returnedAt));

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-3xl font-bold">Gestion des Retours</h1>
      
      <div className="border rounded-xl bg-white overflow-hidden shadow-sm">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Emprunteur</TableHead>
              <TableHead>Livre</TableHead>
              <TableHead>Date d'échéance</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeLoans.map((loan) => {
              const isOverdue = new Date() > new Date(loan.dueDate);
              return (
                <TableRow key={loan.id} className={isOverdue ? "bg-red-50/50" : ""}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{loan.userName}</span>
                      <span className="text-xs text-muted-foreground">{loan.userEmail}</span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{loan.bookTitle}</TableCell>
                  <TableCell>{format(new Date(loan.dueDate), "dd/MM/yyyy", { locale: fr })}</TableCell>
                  <TableCell>
                    {isOverdue ? (
                      <Badge variant="destructive">Retard</Badge>
                    ) : (
                      <Badge variant="secondary">En cours</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <ReturnBookButton loanId={loan.id} bookTitle={loan.bookTitle} />
                  </TableCell>
                </TableRow>
              );
            })}
            {activeLoans.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Aucun emprunt en cours dans la bibliothèque.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}