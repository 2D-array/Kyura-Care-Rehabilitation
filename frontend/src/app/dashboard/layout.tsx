import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#020617] transition-colors duration-300 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none -z-10" />
      
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-40">
        <Sidebar />
      </div>
      <main className="md:pl-64 flex-1">
        {children}
      </main>
    </div>
  )
}
