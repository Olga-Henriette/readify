"use client";

import { useState } from "react";
import { cancelReservation } from "@/lib/actions/reservation-actions";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { toast } from "sonner";

export function CancelReservationButton({ reservationId }: { reservationId: string }) {
  const [loading, setLoading] = useState(false);

  async function handleCancel() {
    if (!confirm("Voulez-vous vraiment annuler cette réservation ?")) return;

    setLoading(true);
    try {
      await cancelReservation(reservationId);
      toast.success("Réservation annulée.");
    } catch (err) {
      toast.error("Impossible d'annuler pour le moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="sm" 
      onClick={handleCancel}
      disabled={loading}
      className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-2"
    >
      <XCircle className="h-4 w-4" />
      {loading ? "Annulation..." : "Annuler"}
    </Button>
  );
}