import type { ReactNode } from "react";
import { useState } from "react";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { AdminSidebar } from "@/components/Admin/AdminSidebar";
import { AdminTopbar } from "@/components/Admin/AdminTopbar";

interface AdminShellProps {
  children: ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div
      className="dark min-h-screen bg-[#0B0F1A] text-slate-100"
      style={{ fontFamily: '"Be Vietnam Pro", "Inter", sans-serif' }}
    >
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 lg:block">
        <AdminSidebar />
      </aside>

      <div className="flex min-h-screen flex-col lg:ml-72">
        <AdminTopbar onOpenSidebar={() => setMobileOpen(true)} />
        <main className="flex-1 px-4 pb-12 pt-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="w-72 border-r-0 p-0">
          <AdminSidebar onNavigate={() => setMobileOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}
