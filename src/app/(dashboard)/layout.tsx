import { Sidebar } from "@/components/layout/sidebar";
import { UserNav } from "@/components/layout/user-nav"; 

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-white flex items-center justify-between px-8">
          <div className="text-sm text-muted-foreground italic">Système Readify v1.0</div>
          <UserNav /> {}
        </header>
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}