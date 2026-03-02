"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { 
  Book, LayoutDashboard, History, User, Settings, 
  Users, ChevronLeft, ChevronRight, LibraryBig 
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  
  const user = session?.user as any; 
  const role = user?.role || "MEMBER";

  const routes = [
    { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", roles: ["ADMIN", "LIBRARIAN", "MEMBER"] },
    { label: "Catalogue", icon: Book, href: "/dashboard/books", roles: ["ADMIN", "LIBRARIAN", "MEMBER"] },
    { label: "Mes Emprunts", icon: History, href: "/dashboard/my-loans", roles: ["MEMBER"] },
    { label: "Gestion Retours", icon: Settings, href: "/dashboard/admin/loans", roles: ["ADMIN", "LIBRARIAN"] },
    { label: "Utilisateurs", icon: Users, href: "/dashboard/admin/users", roles: ["ADMIN"] },
    { label: "Profil", icon: User, href: "/dashboard/profile", roles: ["ADMIN", "LIBRARIAN", "MEMBER"] },
  ];

  return (
    <div className={cn(
      "relative flex flex-col border-r bg-white h-screen transition-all duration-300 shadow-sm",
      isCollapsed ? "w-[80px]" : "w-64"
    )}>
      {/* Bouton pour plier/déplier */}
      <Button
        onClick={() => setIsCollapsed(!isCollapsed)}
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-10 h-6 w-6 rounded-full border bg-white shadow-sm z-50 hover:bg-emerald-50"
      >
        {isCollapsed ? <ChevronRight className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </Button>

      {/* Logo Section */}
      <div className={cn("p-6 flex items-center gap-3", isCollapsed && "justify-center")}>
        <div className="bg-emerald-600 p-2 rounded-lg text-white">
          <LibraryBig size={20} />
        </div>
        {!isCollapsed && <span className="font-bold text-xl tracking-tight text-slate-800">Readify</span>}
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {routes
          .filter((route) => route.roles.includes(role))
          .map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all group",
                pathname === route.href 
                  ? "bg-emerald-50 text-emerald-700" 
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                isCollapsed && "justify-center"
              )}
            >
              <route.icon className={cn("h-5 w-5 shrink-0", pathname === route.href ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600")} />
              {!isCollapsed && <span>{route.label}</span>}
            </Link>
          ))}
      </nav>
    </div>
  );
}