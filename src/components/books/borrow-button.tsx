"use client";

import { useState } from "react";
import { borrowBook } from "@/lib/actions/loan-actions";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";

export function BorrowButton({ bookId, stock }: { bookId: string; stock: number }) {
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);

  async function handleBorrow() {
    if (!session?.user) return toast.error("Vous devez être connecté");
    
    setLoading(true);
    const result = await borrowBook(bookId, session.user.id);
    
    if (result.success) {
      toast.success("Livre emprunté avec succès !");
    } else {
      toast.error("error" in result ? result.error : "Une erreur est survenue");
    }
    setLoading(false);
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleBorrow} 
      disabled={loading || stock <= 0}
      className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800"
    >
      <BookOpen className="h-4 w-4" />
      {loading ? "..." : "Emprunter"}
    </Button>
  );
}