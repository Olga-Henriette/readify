"use client";

import { useState } from "react";
import { returnBook } from "@/lib/actions/return-actions";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export function ReturnBookButton({ loanId, bookTitle }: { loanId: string; bookTitle: string }) {
  const [loading, setLoading] = useState(false);

  async function handleReturn() {
    setLoading(true);
    const result = await returnBook(loanId);
    if (result.success) {
      toast.success(`Le livre "${bookTitle}" a été marqué comme rendu.`);
    } else {
      toast.error("Erreur lors du retour");
    }
    setLoading(false);
  }

  return (
    <Button 
      size="sm" 
      variant="outline" 
      onClick={handleReturn}
      disabled={loading}
      className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50"
    >
      <CheckCircle2 className="h-4 w-4" />
      {loading ? "Traitement..." : "Valider le retour"}
    </Button>
  );
}