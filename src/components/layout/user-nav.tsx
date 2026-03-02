"use client";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserNav() {
  const { data: session } = authClient.useSession();
  const router = useRouter();

  // Cast pour accéder au rôle étendu par better-auth
  const user = session?.user as unknown as { name: string; email: string; role: string; image?: string };

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: { onSuccess: () => router.push("/login") }
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none focus:ring-0">
        <div className="flex items-center gap-2 border p-1 pr-3 rounded-full hover:bg-slate-50 transition-colors cursor-pointer">
          <Avatar className="h-8 w-8 border">
            <AvatarImage src={user?.image || ""} />
            <AvatarFallback className="bg-emerald-100 text-emerald-700">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium hidden md:inline-block">{user?.name}</span>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mt-2">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{user?.name}</p>
            <p className="text-xs leading-none text-muted-foreground">{user?.role}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard/profile")} className="cursor-pointer">
          Mon Profil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}