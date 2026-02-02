"use client";

import Link from "next/link";
import { FileText, CreditCard, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

const ACTIONS = [
    {
        label: "Teklif",
        href: "/proposals/create",
        icon: FileText,
        color: "text-amber-600 bg-amber-500/10 hover:bg-amber-500/20"
    },
    {
        label: "Gider",
        href: "/finance",
        icon: CreditCard,
        color: "text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20"
    },
    {
        label: "Müşteri",
        href: "/customers",
        icon: Users,
        color: "text-blue-600 bg-blue-500/10 hover:bg-blue-500/20"
    },
    {
        label: "Çekim",
        href: "/shoots",
        icon: Calendar,
        color: "text-orange-600 bg-orange-500/10 hover:bg-orange-500/20"
    }
];

export function QuickActionsBar() {
    return (
        <div className="bg-card border border-border rounded-2xl shadow-sm p-4 md:p-6">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">
                Hızlı Erişim
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {ACTIONS.map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link key={action.label} href={action.href}>
                            <Button
                                variant="ghost"
                                className={`w-full h-20 flex flex-col gap-2 ${action.color} border border-transparent hover:border-border transition-all`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-xs font-semibold">{action.label}</span>
                            </Button>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
