import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

export const metadata = {
    title: "Müşteri Portalı | Fennix Media",
    description: "Fennix Media Müşteri Portalı",
}

export default function PortalLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
            {/* Minimal Header */}
            <header className="bg-background/80 border-b border-border h-16 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center text-black font-bold text-lg shadow-sm">
                        F
                    </div>
                    <span className="font-bold text-lg tracking-tight">Fennix Media</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-500/80 uppercase tracking-widest hidden sm:inline bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                        Müşteri Portalı
                    </span>
                    <ThemeToggle />
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 container max-w-5xl mx-auto py-8 px-4">
                {children}
            </main>

            {/* Minimal Footer */}
            <footer className="py-8 text-center text-[10px] text-muted-foreground border-t border-border bg-background uppercase tracking-[0.2em]">
                &copy; {new Date().getFullYear()} Fennix Media. Tüm hakları saklıdır.
            </footer>
        </div>
    )
}
