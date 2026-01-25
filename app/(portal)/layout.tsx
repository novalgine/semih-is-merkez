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
        <div className="flex flex-col min-h-screen bg-background">
            {/* Minimal Header */}
            <header className="bg-card border-b h-16 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold text-lg">
                        F
                    </div>
                    <span className="font-semibold text-lg tracking-tight">Fennix Media</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-sm text-muted-foreground hidden sm:inline">
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
            <footer className="py-6 text-center text-xs text-muted-foreground border-t bg-card">
                &copy; {new Date().getFullYear()} Fennix Media. Tüm hakları saklıdır.
            </footer>
        </div>
    )
}
