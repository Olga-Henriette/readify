import { Sidebar } from "@/components/layout/sidebar";
import { UserNav } from "@/components/layout/user-nav";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#F8FAFC]"> 
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-[#F1F5F9] border-b border-slate-200 flex items-center justify-between px-8 shadow-sm z-30">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-widest">
            Espace de gestion
          </div>
          <UserNav />
        </header>
        
        <main className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}