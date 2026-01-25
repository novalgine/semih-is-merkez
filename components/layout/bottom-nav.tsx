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
        <nav className="fixed bottom-0 left-0 right-0 z-[9999] border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:hidden pb-safe">
            <div className="flex items-center justify-between h-16 px-4">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-colors min-w-[50px]",
                                isActive
                                    ? "text-primary bg-primary/10"
                                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                            )}
                        >
                            <Icon className="h-5 w-5" />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
