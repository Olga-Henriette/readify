"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Book, LayoutDashboard, History, User, Settings } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  
  const user = session?.user as any; 
  const role = user?.role || "MEMBER";

  const routes = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", roles: ["ADMIN", "LIBRARIAN", "MEMBER"] },
    { label: "Catalogue", icon: Book, href: "/dashboard/books", roles: ["ADMIN", "LIBRARIAN", "MEMBER"] },
    { label: "Mes Emprunts", icon: History, href: "/dashboard/my-loans", roles: ["MEMBER"] },
    { label: "Gestion Retours", icon: Settings, href: "/dashboard/admin/loans", roles: ["ADMIN", "LIBRARIAN"] },
    { label: "Profil", icon: User, href: "/dashboard/profile", roles: ["ADMIN", "LIBRARIAN", "MEMBER"] },
  ];

  return (
    <div className="flex flex-col w-64 border-r bg-slate-50/50 h-screen p-4 space-y-2">
      <div className="font-bold text-xl px-4 mb-8 text-emerald-600 tracking-tight">Readify</div>
      <nav className="flex-1 space-y-1">
        {routes
          .filter((route) => route.roles.includes(role))
          .map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                pathname === route.href 
                  ? "bg-white text-emerald-600 shadow-sm border border-emerald-100" 
                  : "text-slate-600 hover:bg-white/50 hover:text-emerald-600"
              )}
            >
              <route.icon className="h-4 w-4" />
              {route.label}
            </Link>
          ))}
      </nav>
    </div>
  );
}