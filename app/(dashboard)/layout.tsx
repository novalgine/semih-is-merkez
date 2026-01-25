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
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { Header } from "@/components/layout/header"
import { InstallPrompt } from "@/components/pwa/install-prompt"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
            <div className="hidden border-r bg-muted/40 md:block">
                <div className="flex h-full max-h-screen flex-col gap-2">
                    <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                        <Link href="/" className="flex items-center gap-2 font-semibold">
                            <Video className="h-6 w-6" />
                            <span className="">SEMİH İŞ MERKEZİ</span>
                        </Link>
                    </div>
                    <div className="flex-1">
                        <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                            <Link
                                href="/"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <Home className="h-4 w-4" />
                                Dashboard
                            </Link>
                            <Link
                                href="/customers"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <Users className="h-4 w-4" />
                                Müşteriler
                            </Link>
                            <Link
                                href="/proposals"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <FileText className="h-4 w-4" />
                                Teklifler
                            </Link>
                            <Link
                                href="/shoots"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <Video className="h-4 w-4" />
                                Çekimler
                            </Link>
                            <Link
                                href="/daily"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <BookOpen className="h-4 w-4" />
                                Günlük
                            </Link>
                            <Link
                                href="/services"
                                className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                            >
                                <Package className="h-4 w-4" />
                                Hizmetler
                            </Link>
                        </nav>
                    </div>
                    <div className="mt-auto p-4">
                        <div className="flex items-center gap-4">
                            <Avatar>
                                <AvatarImage src="/placeholder-user.jpg" alt="@semih" />
                                <AvatarFallback>S</AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                                <span className="text-sm font-medium">Semih</span>
                                <span className="text-xs text-muted-foreground">Pro Üye</span>
                            </div>
                            <Button variant="ghost" size="icon" className="ml-auto">
                                <Settings className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex flex-col">
                <Header />
                <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                    {children}
                </main>
            </div>
            <InstallPrompt />
        </div>
    )
}
