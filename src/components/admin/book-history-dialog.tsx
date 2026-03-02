"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, User, ArrowRight } from "lucide-react";
import { format } from "date-fns"; 
import { fr } from "date-fns/locale";

export function BookHistoryDialog({ bookId, bookTitle, borrowCount }: { bookId: string, bookTitle: string, borrowCount: number }) {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  async function fetchHistory() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/book-history?id=${bookId}`);
      const data = await response.json();
      setHistory(data);
    } catch (error) {
      console.error("Erreur historique:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div 
          onClick={fetchHistory}
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-all group"
        >
          <span className="font-medium text-slate-700 group-hover:text-emerald-700">{bookTitle}</span>
          <Badge variant="secondary" className="bg-emerald-50 text-emerald-700">
            {borrowCount} fois
          </Badge>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            Historique : <span className="text-emerald-600">{bookTitle}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lecteur</TableHead>
                <TableHead>Emprunt le</TableHead>
                <TableHead>Retour le</TableHead>
                <TableHead>Statut</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={4} className="text-center">Chargement...</TableCell></TableRow>
              ) : history.length === 0 ? (
                <TableRow><TableCell colSpan={4} className="text-center italic">Aucun historique trouvé.</TableCell></TableRow>
              ) : (
                history.map((h, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium flex items-center gap-2">
                      <User className="h-3 w-3 text-slate-400" /> {h.userName}
                    </TableCell>
                    <TableCell className="text-xs">
                      {format(new Date(h.borrowedAt), "dd MMM yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell className="text-xs">
                      {h.returnedAt 
                        ? format(new Date(h.returnedAt), "dd MMM yyyy", { locale: fr })
                        : "---"}
                    </TableCell>
                    <TableCell>
                      {h.returnedAt ? (
                        <Badge className="bg-slate-100 text-slate-600 border-none">Rendu</Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-700 border-none">En main</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </DialogContent>
    </Dialog>
  );
}