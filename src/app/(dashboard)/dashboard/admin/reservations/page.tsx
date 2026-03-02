import { db } from "@/lib/db";
import { reservations, books, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default async function AdminReservationsPage() {
  const allRes = await db
    .select({
      id: reservations.id,
      bookTitle: books.title,
      userName: users.name,
      createdAt: reservations.reservedAt,
      status: reservations.status,
    })
    .from(reservations)
    .innerJoin(books, eq(reservations.bookId, books.id))
    .innerJoin(users, eq(reservations.userId, users.id))
    .orderBy(desc(reservations.reservedAt));

  return (
    <div className="p-8 space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">File d'attente des Réservations</h1>
      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead>Livre</TableHead>
              <TableHead>Membre</TableHead>
              <TableHead>Date demande</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allRes.map((res) => (
              <TableRow key={res.id}>
                <TableCell className="font-medium">{res.bookTitle}</TableCell>
                <TableCell>{res.userName}</TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {new Date(res.createdAt!).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge variant={res.status === "PENDING" ? "secondary" : "outline"}>
                    {res.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}