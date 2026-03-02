import { db } from "@/lib/db";
import { books, borrowings, users } from "@/lib/db/schema";
import { count, desc, eq, gte, sql, sum } from "drizzle-orm"; 
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Book, Users, TrendingUp, AlertTriangle, BookmarkCheck, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { BookHistoryDialog } from "@/components/admin/book-history-dialog";

export default async function DashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  const isAdmin = session?.user.role === "ADMIN";

  // Calcul de la tendance (30 derniers jours)
  const lastMonth = new Date();
  lastMonth.setDate(lastMonth.getDate() - 30);

  const allTimeBestSellers = await db
    .select({
      id: books.id,
      title: books.title,
      borrowCount: count(borrowings.id),
    })
    .from(books)
    .leftJoin(borrowings, eq(books.id, borrowings.bookId))
    .groupBy(books.id, books.title)
    .orderBy(desc(count(borrowings.id)))
    .limit(5);

  // Requête Tendance (Membre & Admin)
  const trendingBooks = await db
    .select({
      title: books.title,
      author: books.author,
      borrowCount: count(borrowings.id),
    })
    .from(books)
    .innerJoin(borrowings, eq(books.id, borrowings.bookId))
    .where(gte(borrowings.borrowedAt, lastMonth)) 
    .groupBy(books.title, books.author)
    .orderBy(desc(count(borrowings.id)))
    .limit(6);

  // Requêtes spécifiques Admin
  let adminStats = { totalFines: 0, topUsers: [] as any[] };
  
  if (isAdmin) {
    const [fineResult] = await db.select({ total: sum(users.fineBalance) }).from(users);
    adminStats.totalFines = Number(fineResult?.total || 0);

    adminStats.topUsers = await db
      .select({
        name: users.name,
        borrowCount: count(borrowings.id),
      })
      .from(users)
      .leftJoin(borrowings, eq(users.id, borrowings.userId))
      .groupBy(users.name)
      .orderBy(desc(count(borrowings.id)))
      .limit(5);
  }

  return (
    <div className="p-8 space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">
          {isAdmin ? "Centre de Pilotage" : `Ravi de vous revoir, ${session?.user.name} !`}
        </h1>
        <p className="text-muted-foreground italic text-sm">
          {isAdmin 
            ? "Aide à la décision et gestion financière." 
            : "Voici ce qui fait vibrer la bibliothèque ce mois-ci."}
        </p>
      </header>

      {/* --- VUE MEMBRE : TENDANCES --- */}
      {!isAdmin && (
        <section className="space-y-6">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg">
              <TrendingUp className="text-emerald-600 h-5 w-5" />
            </div>
            <h2 className="text-xl font-semibold">Tendances du moment</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trendingBooks.length > 0 ? (
              trendingBooks.map((book, i) => (
                <Card key={i} className="group hover:border-emerald-200 transition-all shadow-sm">
                  <CardContent className="p-5 flex flex-col justify-between h-40">
                    <div>
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-800 line-clamp-2 text-lg">{book.title}</h3>
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{book.author}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-100">
                        🔥 {book.borrowCount} emprunts ce mois
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <p className="text-muted-foreground italic">Aucune donnée de tendance pour le moment.</p>
            )}
          </div>
        </section>
      )}

      {/* --- VUE ADMIN : ANALYSE --- */}
      {isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* TOP LIVRES - CLIQUABLE */}
          <Card className="bg-white shadow-sm border-slate-200">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 uppercase tracking-tighter">
                <TrendingUp className="h-4 w-4 text-emerald-600" />
                Palmarès des Ouvrages (Analytique)
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <p className="text-xs text-muted-foreground mb-4">
                Cliquez sur un titre pour voir les détails des rotations.
              </p>
              {allTimeBestSellers.map((b) => (
                <BookHistoryDialog 
                  key={b.id} 
                  bookId={b.id} 
                  bookTitle={b.title} 
                  borrowCount={b.borrowCount} 
                />
              ))}
            </CardContent>
          </Card>

          {/* Lecteurs Actifs (Aide à la décision) */}
          <Card className="bg-white">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-blue-600" />
                Lecteurs les plus fidèles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {adminStats.topUsers.map((u, i) => (
                <div key={i} className="flex items-center justify-between text-sm border-b pb-2 last:border-0">
                  <span className="font-medium text-slate-700">{u.name}</span>
                  <Badge variant="outline">{u.borrowCount} livres</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}