"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        await authClient.signUp.email({
            email,
            password,
            name,
            callbackURL: "/login",
        }, {
            onRequest: () => setLoading(true),
            onResponse: () => setLoading(false),
            onError: (ctx) => {
                toast.error(ctx.error.message);
            },
            onSuccess: () => {
                toast.success("Compte créé ! Redirection...");
                router.push("/login");
            }
        });
    };

    return (
        <div className="flex h-screen w-full items-center justify-center px-4">
            <Card className="w-full max-w-md shadow-lg border-slate-200">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">Créer un compte</CardTitle>
                    <CardDescription>
                        Entrez vos informations pour rejoindre la bibliothèque
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nom complet</Label>
                            <Input 
                                id="name" 
                                placeholder="John Doe" 
                                required 
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="m@example.com" 
                                required 
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Mot de passe</Label>
                            <Input 
                                id="password" 
                                type="password" 
                                required 
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} 
                            />
                        </div>
                        <Button className="w-full font-semibold" type="submit" disabled={loading}>
                            {loading ? "Chargement..." : "S'inscrire"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}