import { Sidebar } from "@/components/sidebar"
import { MobileNav } from "@/components/mobile-nav"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row min-h-[calc(100vh-120px)] bg-slate-50 dark:bg-[#020617] transition-colors duration-300 relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      
      <MobileNav />
      
      <div className="hidden md:flex w-64 flex-col shrink-0 sticky top-0 h-[calc(100vh-120px)]">
        <Sidebar />
      </div>
      
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
