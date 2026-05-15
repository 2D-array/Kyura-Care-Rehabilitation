import Link from "next/link";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-black tracking-tighter text-indigo-600 dark:text-indigo-400">CuraReb</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          <Link href="/doctors" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80">Find a Specialist</Link>
          <Link href="#" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80">Treatments</Link>
          <Link href="#" className="transition-colors hover:text-indigo-600 dark:hover:text-indigo-400 text-foreground/80">How it Works</Link>
        </nav>
        <div className="flex items-center space-x-4">
          <ModeToggle />
          <Link href="/login">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-semibold px-6 shadow-md hover:shadow-lg transition-all">Sign In</Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
