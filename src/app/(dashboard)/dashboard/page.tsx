import { db } from "@/lib/db";
import { books, borrowings } from "@/lib/db/schema";
import { count, desc, isNull } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, BookmarkCheck, LayoutDashboard } from "lucide-react";

export default async function DashboardPage() {
  // 1. Récupération des stats côté serveur
  const [booksCount] = await db.select({ value: count() }).from(books);
  const [activeLoans] = await db.select({ value: count() }).from(borrowings).where(isNull(borrowings.returnedAt));
  const topBooks = await db.select().from(books).orderBy(desc(books.stock)).limit(5);

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tableau de Bord</h1>
        <p className="text-muted-foreground">Aperçu en temps réel de la bibliothèque.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-emerald-100 bg-emerald-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600">Total Livres</CardTitle>
            <Book className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{booksCount.value}</div>
          </CardContent>
        </Card>

        <Card className="border-blue-100 bg-blue-50/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Emprunts actifs</CardTitle>
            <BookmarkCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeLoans.value}</div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white border rounded-xl p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Top 5 - Stock Catalogue</h2>
        <div className="space-y-4">
          {topBooks.map((book) => (
            <div key={book.id} className="flex items-center justify-between border-b pb-2 last:border-0">
              <div>
                <p className="font-medium">{book.title}</p>
                <p className="text-xs text-muted-foreground">{book.author}</p>
              </div>
              <span className="text-sm font-mono bg-slate-100 px-2 py-1 rounded">
                {book.stock} ex.
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}