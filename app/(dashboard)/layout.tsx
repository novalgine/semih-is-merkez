import Link from "next/link"
import {
    Home,
    Users,
    FileText,
    Video,
    BookOpen,
    Menu,
    Search,
    Settings,
    CircleUser,
    Package,
    Wallet,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Header } from "@/components/layout/header"
import { BottomNav } from "@/components/layout/bottom-nav"
import { InstallPrompt } from "@/components/pwa/install-prompt"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen w-full bg-background p-4 gap-4">
            {/* Desktop Floating Sidebar */}
            <div className="hidden md:flex w-[220px] lg:w-[280px] flex-col rounded-3xl border border-sidebar-border bg-sidebar backdrop-blur-xl transition-all duration-300">
                <div className="flex h-full flex-col gap-2">
                    <div className="flex h-16 items-center border-b border-sidebar-border px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                                <Video className="h-5 w-5" />
                            </div>
                            <span className="tracking-tight">Fennix OS</span>
                        </Link>
                    </div>
                    <div className="flex-1 overflow-auto py-4">
                        <nav className="grid items-start px-4 text-sm font-medium gap-1">
                            <Link
                                href="/"
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            >
                                <Home className="h-4 w-4" />
                                Dashboard
                            </Link>
                            <Link
                                href="/customers"
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            >
                                <Users className="h-4 w-4" />
                                Müşteriler
                            </Link>
                            <Link
                                href="/proposals"
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            >
                                <FileText className="h-4 w-4" />
                                Teklifler
                            </Link>
                            <Link
                                href="/shoots"
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            >
                                <Video className="h-4 w-4" />
                                Çekimler
                            </Link>
                            <Link
                                href="/daily"
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            >
                                <BookOpen className="h-4 w-4" />
                                Günlük
                            </Link>
                            <Link
                                href="/services"
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            >
                                <Package className="h-4 w-4" />
                                Hizmetler
                            </Link>
                            <Link
                                href="/finance"
                                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground transition-all hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                            >
                                <Wallet className="h-4 w-4" />
                                Finans
                            </Link>
                        </nav>
                    </div>
                    <div className="mt-auto p-4 border-t border-sidebar-border">
                        <div className="flex items-center gap-3 rounded-xl bg-sidebar-accent/50 p-3">
                            <Avatar className="h-9 w-9 border border-sidebar-border">
                                <AvatarImage src="/placeholder-user.jpg" alt="@semih" />
                                <AvatarFallback>S</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-medium truncate text-sidebar-foreground">Semih</span>
                                <span className="text-xs text-muted-foreground truncate">Pro Üye</span>
                            </div>
                            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 rounded-lg hover:bg-background/50">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-border/50 bg-card/50 backdrop-blur-sm">
                <Header />
                <main className="flex-1 overflow-auto p-4 lg:p-8">
                    {children}
                </main>
            </div>

            <BottomNav />
            <InstallPrompt />
        </div>
    )
}
