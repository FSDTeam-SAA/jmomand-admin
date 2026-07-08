import { AppSidebar } from "@/components/layout/app-sidebar";
import { TopHeader } from "@/components/layout/top-header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-100">
      <AppSidebar />
      <div className="min-h-screen lg:pl-64">
        <TopHeader />
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
