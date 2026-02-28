"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function DashboardPage() {
    const { data: session, isPending } = authClient.useSession();
    const router = useRouter();

    const handleLogout = async () => {
        await authClient.signOut({
            fetchOptions: {
                onSuccess: () => {
                    toast.success("Déconnecté avec succès");
                    router.push("/login");
                },
            },
        });
    };

    if (isPending) return <div className="p-8">Chargement...</div>;

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-3xl font-bold">Bienvenue, {session?.user?.name} !</h1>
            <p className="text-slate-500">Ceci est votre espace bibliothèque Readify.</p>
            
            <div className="pt-4">
                <Button variant="destructive" onClick={handleLogout}>
                    Se déconnecter
                </Button>
            </div>
        </div>
    );
}