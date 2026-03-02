export function calculateLiveFine(dueDate: Date, currentFineBalance: number): number {
  const now = new Date();
  const due = new Date(dueDate);

  if (now <= due) return currentFineBalance;

  // Calcul du nombre de jours de retard
  const diffTime = Math.abs(now.getTime() - due.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  // 1€ (100 cts) par jour de retard cumulé au solde existant
  return currentFineBalance + (diffDays * 100);
}