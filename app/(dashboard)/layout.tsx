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
import { SidebarLink } from "@/components/layout/sidebar-link"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="flex min-h-screen w-full bg-background p-4 gap-4">
            {/* Desktop Floating Sidebar */}
            <div className="hidden md:flex w-[220px] lg:w-[280px] flex-col rounded-3xl glass-panel specular-border transition-all duration-300">
                <div className="flex h-full flex-col gap-2">
                    <div className="flex h-16 items-center border-b border-border px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold text-sidebar-foreground">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground electric-glow">
                                <Video className="h-5 w-5" />
                            </div>
                            <span className="tracking-tight text-foreground">Fennix OS</span>
                        </Link>
                    </div>
                    <div className="flex-1 overflow-auto py-4">
                        <nav className="grid items-start px-4 text-sm font-medium gap-1">
                            <SidebarLink href="/" label="Dashboard">
                                <Home className="h-4 w-4" />
                            </SidebarLink>
                            <SidebarLink href="/customers" label="Müşteriler">
                                <Users className="h-4 w-4" />
                            </SidebarLink>
                            <SidebarLink href="/proposals" label="Teklifler">
                                <FileText className="h-4 w-4" />
                            </SidebarLink>
                            <SidebarLink href="/shoots" label="Çekimler">
                                <Video className="h-4 w-4" />
                            </SidebarLink>
                            <SidebarLink href="/daily" label="Günlük">
                                <BookOpen className="h-4 w-4" />
                            </SidebarLink>
                            <SidebarLink href="/services" label="Hizmetler">
                                <Package className="h-4 w-4" />
                            </SidebarLink>
                            <SidebarLink href="/finance" label="Finans">
                                <Wallet className="h-4 w-4" />
                            </SidebarLink>
                        </nav>
                    </div>
                    <div className="mt-auto p-4 border-t border-border">
                        <div className="flex items-center gap-3 rounded-xl bg-muted/50 p-3 border border-border">
                            <Avatar className="h-9 w-9 border border-border">
                                <AvatarImage src="/placeholder-user.jpg" alt="@semih" />
                                <AvatarFallback className="bg-primary/20 text-primary">S</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col overflow-hidden">
                                <span className="text-sm font-medium truncate text-foreground">Semih</span>
                                <span className="text-xs text-muted-foreground truncate">Pro Üye</span>
                            </div>
                            <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col overflow-hidden rounded-3xl border border-border bg-card shadow-2xl relative">
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
