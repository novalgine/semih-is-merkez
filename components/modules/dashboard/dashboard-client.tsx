"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import {
    ArrowUpRight,
    Calendar,
    Users,
    Video,
    Clock
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { staggerContainer, staggerItem } from "@/lib/motion-variants";

type DashboardStats = {
    completedTasksToday: number;
    lastTaskDate: string | null;
    totalCustomers: number;
    upcomingShoots: Array<{
        id: string;
        title: string;
        shoot_date: string;
        customers: { name: string } | null;
    }>;
};

export function DashboardClient({ stats }: { stats: DashboardStats }) {
    return (
        <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
        >
            {/* DEBUG: Magnetic Test Button */}
            <div className="col-span-1 md:col-span-2 flex justify-center">
                <MagneticButton
                    className="bg-red-600 hover:bg-red-700 text-white w-full py-8 text-xl font-bold"
                    strength={0.5}
                >
                    🧲 MAGNETIC TEST BUTTON (WIGGLE ME)
                </MagneticButton>
            </div>

            {/* Sol Kolon: Task Completion ve Müşteri */}
            <div className="col-span-1 space-y-6">
                <motion.div variants={staggerItem}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Bugünkü Performans</CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.completedTasksToday} Görev</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Bugün tamamlandı
                            </p>
                            {stats.lastTaskDate && (
                                <p className="text-xs text-muted-foreground mt-2">
                                    Son aktivite: {format(new Date(stats.lastTaskDate), "HH:mm")}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={staggerItem}>
                    <Card className="shadow-sm hover:shadow-md transition-shadow">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Toplam Müşteri</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
                            <p className="text-xs text-muted-foreground mt-1">
                                Aktif portföy büyüklüğü.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Sağ Kolon: Yaklaşan Çekimler */}
            <motion.div variants={staggerItem}>
                <Card className="col-span-1 md:col-span-1 md:row-span-2 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Video className="h-5 w-5 text-primary" />
                            Yaklaşan Çekimler
                        </CardTitle>
                        <CardDescription>Önümüzdeki prodüksiyon takvimi</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1">
                        {stats.upcomingShoots.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center p-4 text-muted-foreground">
                                <Calendar className="h-8 w-8 mb-2 opacity-20" />
                                <p>Yakın zamanda planlanmış çekim yok.</p>
                                <Link href="/shoots/create" className="mt-4">
                                    <MagneticButton variant="outline" size="sm">
                                        Planla
                                    </MagneticButton>
                                </Link>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {stats.upcomingShoots.map((shoot) => (
                                    <div key={shoot.id} className="flex items-start gap-4 group">
                                        <div className="flex flex-col items-center bg-muted rounded-md p-2 min-w-[60px]">
                                            <span className="text-xs font-bold text-muted-foreground uppercase">
                                                {format(new Date(shoot.shoot_date), "MMM", { locale: tr })}
                                            </span>
                                            <span className="text-xl font-bold text-foreground">
                                                {format(new Date(shoot.shoot_date), "dd")}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="font-medium leading-none group-hover:text-primary transition-colors">
                                                {shoot.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {shoot.customers?.name}
                                            </p>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
                                                <Clock className="h-3 w-3" />
                                                {format(new Date(shoot.shoot_date), "HH:mm")}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    <div className="p-6 pt-0 mt-auto">
                        <Link href="/shoots">
                            <Button variant="ghost" className="w-full justify-between group">
                                Tüm Takvimi Gör
                                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                            </Button>
                        </Link>
                    </div>
                </Card>
            </motion.div>
        </motion.div>
    );
}
