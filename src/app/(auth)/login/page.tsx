"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        
        await authClient.signIn.email({
            email,
            password,
        }, {
            onRequest: () => setLoading(true),
            onResponse: () => setLoading(false),
            onError: (ctx) => {
                toast.error(ctx.error.message);
            },
            onSuccess: () => {
                toast.success("Connexion réussie !");
                router.push("/dashboard");
                router.refresh();
            }
        });
    };

    return (
        <div className="flex h-screen w-full items-center justify-center px-4 bg-slate-50">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader>
                    <CardTitle className="text-2xl font-bold text-slate-900">Connexion</CardTitle>
                    <CardDescription>Accédez à votre espace Readify</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input 
                                id="email" 
                                type="email" 
                                placeholder="votre@email.com"
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
                            {loading ? "Connexion en cours..." : "Se connecter"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}