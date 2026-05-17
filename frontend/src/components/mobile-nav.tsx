"use client"
import { useState, useEffect } from "react"
import { Menu, X } from "lucide-react"
import { Sidebar } from "./sidebar"
import { AnimatePresence, motion } from "framer-motion"
import { usePathname } from "next/navigation"

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  // Close the drawer when the route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  return (
    <>
      <div className="md:hidden flex items-center p-4 border-b border-slate-200/60 dark:border-white/5 bg-white/50 dark:bg-slate-900/20 backdrop-blur-xl sticky top-0 z-30">
        <button onClick={() => setIsOpen(true)} className="p-2 -ml-2 text-slate-600 dark:text-slate-400">
          <Menu className="w-6 h-6" />
        </button>
        <span className="ml-2 font-bold text-lg text-slate-900 dark:text-white">Dashboard</span>
      </div>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 z-50 md:hidden bg-slate-50 dark:bg-[#020617] shadow-2xl"
            >
              <Sidebar />
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
