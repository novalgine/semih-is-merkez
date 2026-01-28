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
        <div className="flex flex-col min-h-screen bg-zinc-950">
            {/* Minimal Header */}
            <header className="bg-zinc-900/50 border-b border-white/5 h-16 flex items-center justify-between px-6 sticky top-0 z-10 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-amber-500 rounded-lg flex items-center justify-center text-black font-bold text-lg shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                        F
                    </div>
                    <span className="font-bold text-lg tracking-tight text-white">Fennix Media</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-xs font-bold text-amber-500/80 uppercase tracking-widest hidden sm:inline bg-amber-500/5 px-3 py-1 rounded-full border border-amber-500/10">
                        Müşteri Portalı
                    </span>
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 container max-w-5xl mx-auto py-8 px-4">
                {children}
            </main>

            {/* Minimal Footer */}
            <footer className="py-8 text-center text-[10px] text-zinc-600 border-t border-white/5 bg-zinc-950 uppercase tracking-[0.2em]">
                &copy; {new Date().getFullYear()} Fennix Media. Tüm hakları saklıdır.
            </footer>
        </div>
    )
}
