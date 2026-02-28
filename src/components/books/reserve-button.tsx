"use client";

import { useState } from "react";
import { reserveBook } from "@/lib/actions/reservation-actions";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";

export function ReserveButton({ bookId }: { bookId: string }) {
  const { data: session } = authClient.useSession();
  const [loading, setLoading] = useState(false);

  async function handleReserve() {
    if (!session?.user) return toast.error("Connectez-vous pour réserver");
    
    setLoading(true);
    try {
      const result = await reserveBook(bookId, session.user.id);
      
      if (result.success) {
        toast.success("Réservation enregistrée !");
      } else {
        const msg = (result as { error?: string }).error || "Erreur lors de la réservation";
        toast.error(msg);
      }
    } catch (err) {
      // force le message en string pour éviter l'erreur sur 'unknown'
      const errorMsg = err instanceof Error ? err.message : "Une erreur réseau est survenue";
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleReserve} 
      disabled={loading}
      className="gap-2 border-amber-200 text-amber-700 hover:bg-amber-50"
    >
      <CalendarClock className="h-4 w-4" />
      {loading ? "..." : "Réserver"}
    </Button>
  );
}