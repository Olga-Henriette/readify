import { db } from "@/lib/db";
import { books } from "@/lib/db/schema";
import { ilike, or } from "drizzle-orm"; 
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { AddBookDialog } from "@/components/books/add-book-dialog";
import { BookSearch } from "@/components/books/book-search";

interface PageProps {
  searchParams: Promise<{ query?: string }>;
}

export default async function BooksPage({ searchParams }: PageProps) {
  const query = (await searchParams).query;

  // Filtrage SQL 
  const allBooks = await db
    .select()
    .from(books)
    .where(
      query 
        ? or(
            ilike(books.title, `%${query}%`),
            ilike(books.author, `%${query}%`),
            ilike(books.isbn, `%${query}%`)
          )
        : undefined
    );

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Catalogue</h1>
          <p className="text-muted-foreground text-sm">Gérez les ouvrages de votre bibliothèque.</p>
        </div>
        <div className="flex items-center gap-3">
          <BookSearch />
          <AddBookDialog />
        </div>
      </div>

      <div className="border rounded-xl bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold">Livre</TableHead>
              <TableHead className="font-semibold">Auteur</TableHead>
              <TableHead className="font-semibold">ISBN</TableHead>
              <TableHead className="font-semibold text-center">Disponibilité</TableHead>
              <TableHead className="text-right font-semibold">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allBooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic">
                  Aucun ouvrage trouvé pour cette recherche.
                </TableCell>
              </TableRow>
            ) : (
              allBooks.map((book) => (
                <TableRow key={book.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-medium text-slate-900">{book.title}</TableCell>
                  <TableCell className="text-slate-600">{book.author}</TableCell>
                  <TableCell className="font-mono text-[11px] text-slate-400">{book.isbn}</TableCell>
                  <TableCell className="text-center">
                    <Badge 
                      variant={book.stock > 0 ? "secondary" : "destructive"}
                      className={book.stock > 0 ? "bg-emerald-50 text-emerald-700 border-emerald-200" : ""}
                    >
                      {book.stock} en stock
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" className="h-8 border-slate-200">
                      Modifier
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}