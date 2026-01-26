"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, FileText, Video, BookOpen, Package, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
    {
        href: "/",
        label: "Ana Sayfa",
        icon: Home,
    },
    {
        href: "/customers",
        label: "Müşteriler",
        icon: Users,
    },
    {
        href: "/shoots",
        label: "Çekimler",
        icon: Video,
    },
    {
        href: "/finance",
        label: "Finans",
        icon: Wallet,
    },
];

export function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-4 left-4 right-4 z-[9999] rounded-2xl border border-white/10 bg-background/80 backdrop-blur-lg shadow-lg md:hidden pb-0">
            <div className="flex items-center justify-between h-16 px-6">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 p-2 rounded-xl transition-all duration-300 min-w-[50px]",
                                isActive
                                    ? "text-primary bg-primary/10 scale-105"
                                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                            )}
                        >
                            <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
