import { cn } from "@/lib/utils"

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
        <div className="flex flex-col min-h-screen bg-gray-50">
            {/* Minimal Header */}
            <header className="bg-white border-b h-16 flex items-center justify-between px-6 sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 bg-black rounded-lg flex items-center justify-center text-white font-bold text-lg">
                        F
                    </div>
                    <span className="font-semibold text-lg tracking-tight">Fennix Media</span>
                </div>
                <div className="text-sm text-muted-foreground">
                    Müşteri Portalı
                </div>
            </header>

            {/* Content */}
            <main className="flex-1 container max-w-5xl mx-auto py-8 px-4">
                {children}
            </main>

            {/* Minimal Footer */}
            <footer className="py-6 text-center text-xs text-muted-foreground border-t bg-white">
                &copy; {new Date().getFullYear()} Fennix Media. Tüm hakları saklıdır.
            </footer>
        </div>
    )
}
