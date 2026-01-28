import Link from "next/link"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import {
    Calendar,
    FileVideo,
    Wallet,
    ArrowRight,
    Clock,
    CheckCircle2,
    LayoutDashboard
} from "lucide-react"

export const dynamic = 'force-dynamic'

import { getPortalCustomer, getPortalShoots, getPortalDeliverables } from "@/app/actions/portal-public"
import { Button } from "@/components/ui/button"
import { InteractiveCard } from "@/components/ui/interactive-card"
import { BookingCard } from "@/components/portal/booking-modal"

interface PageProps {
    params: Promise<{
        token: string
    }>
}

export default async function PortalDashboard({ params }: PageProps) {
    const { token } = await params

    let customer = null
    try {
        customer = await getPortalCustomer(token)
    } catch (error) {
        console.error("Failed to fetch customer:", error)
    }

    if (!customer) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
                <h1 className="text-2xl font-bold text-red-500 mb-4">Erişim Hatası</h1>
                <p className="text-muted-foreground mb-4">Müşteri bilgileri alınamadı veya token geçersiz.</p>
                <Link href="/">
                    <Button variant="outline">Ana Sayfaya Dön</Button>
                </Link>
            </div>
        )
    }

    let shoots: any[] = []
    let deliverables: any[] = []
    try {
        shoots = await getPortalShoots(token)
        deliverables = await getPortalDeliverables(token)
    } catch (error) {
        console.error("Failed to fetch portal data:", error)
    }

    // İstatistikler
    const upcomingShoots = shoots.filter(s => new Date(s.shoot_date) >= new Date())
    const nextShoot = upcomingShoots[0]
    const completedShoots = shoots.filter(s => s.status === 'completed').length

    return (
        <div className="space-y-10 pb-20">
            {/* Welcome Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-amber-500 mb-2">
                        <LayoutDashboard className="h-5 w-5" />
                        <span className="text-xs font-bold uppercase tracking-widest">Müşteri Paneli</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tight text-white">
                        Hoş Geldiniz, {customer.name}
                    </h1>
                    <p className="text-zinc-500 mt-2 text-lg">
                        {customer.company ? `${customer.company} - ` : ""}Proje süreçlerinizi buradan takip edebilirsiniz.
                    </p>
                </div>
                <div className="flex items-center gap-3 text-sm font-medium text-emerald-500 bg-emerald-500/5 px-5 py-2.5 rounded-full border border-emerald-500/10 shadow-sm self-start md:self-center">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    Sistem Aktif
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Next Shoot Card */}
                <InteractiveCard className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl hover:border-amber-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Calendar className="h-5 w-5 text-amber-500" />
                        </div>
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Sıradaki Çekim</span>
                    </div>

                    {nextShoot ? (
                        <div>
                            <div className="text-3xl font-bold text-white tabular-nums">
                                {format(new Date(nextShoot.shoot_date), "d MMMM", { locale: tr })}
                            </div>
                            <p className="text-sm text-zinc-400 mt-2 line-clamp-1 font-medium">
                                {nextShoot.title}
                            </p>
                            <div className="flex items-center gap-2 text-xs text-amber-500/80 mt-4 font-bold uppercase tracking-tighter">
                                <Clock className="h-3.5 w-3.5" />
                                {format(new Date(nextShoot.shoot_date), "HH:mm")} • {nextShoot.location || "Konum Belirsiz"}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="text-xl font-bold text-zinc-400">Planlanmış çekim yok</div>
                            <p className="text-sm text-zinc-500 mt-2">
                                Yeni bir proje için toplantı planlayabilirsiniz.
                            </p>
                        </div>
                    )}
                </InteractiveCard>

                {/* Deliverables Card */}
                <InteractiveCard className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl hover:border-amber-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <FileVideo className="h-5 w-5 text-amber-500" />
                        </div>
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Medya Arşivi</span>
                    </div>

                    <div className="text-3xl font-bold text-white tabular-nums">{deliverables.length} Dosya</div>
                    <p className="text-sm text-zinc-400 mt-2 font-medium">
                        Tüm teslim edilen içerikleriniz güvende.
                    </p>
                    <div className="mt-5">
                        <Link href={`/portal/${token}/archive`}>
                            <Button variant="link" className="p-0 h-auto text-amber-500 font-bold uppercase text-xs tracking-widest hover:text-amber-400 transition-colors">
                                Arşivi Görüntüle <ArrowRight className="ml-2 h-3.5 w-3.5" />
                            </Button>
                        </Link>
                    </div>
                </InteractiveCard>

                {/* Project Status Card */}
                <InteractiveCard className="bg-zinc-900/50 border border-white/5 p-6 rounded-2xl hover:border-amber-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] group">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CheckCircle2 className="h-5 w-5 text-amber-500" />
                        </div>
                        <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Başarı Oranı</span>
                    </div>

                    <div className="text-3xl font-bold text-white tabular-nums">{completedShoots} Proje</div>
                    <p className="text-sm text-zinc-400 mt-2 font-medium">
                        Birlikte tamamladığımız işler.
                    </p>
                    <div className="mt-4 h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full" style={{ width: '100%' }} />
                    </div>
                </InteractiveCard>
            </div>

            {/* Navigation Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href={`/portal/${token}/calendar`} className="h-full">
                    <InteractiveCard className="h-full p-6 rounded-2xl bg-zinc-900/30 border border-white/5 hover:border-amber-500/50 transition-all group">
                        <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Calendar className="h-5 w-5 text-amber-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">Proje Takvimi</h3>
                        <p className="text-sm text-zinc-500 mt-2">
                            Tüm çekim planlamalarınızı ve set tarihlerini görüntüleyin.
                        </p>
                    </InteractiveCard>
                </Link>

                <Link href={`/portal/${token}/archive`} className="h-full">
                    <InteractiveCard className="h-full p-6 rounded-2xl bg-zinc-900/30 border border-white/5 hover:border-amber-500/50 transition-all group">
                        <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FileVideo className="h-5 w-5 text-amber-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">Medya Arşivi</h3>
                        <p className="text-sm text-zinc-500 mt-2">
                            Teslim edilen video, fotoğraf ve ham kayıtlarınıza erişin.
                        </p>
                    </InteractiveCard>
                </Link>

                <Link href={`/portal/${token}/finance`} className="h-full">
                    <InteractiveCard className="h-full p-6 rounded-2xl bg-zinc-900/30 border border-white/5 hover:border-amber-500/50 transition-all group">
                        <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Wallet className="h-5 w-5 text-amber-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-white group-hover:text-amber-400 transition-colors">Finans & Ödeme</h3>
                        <p className="text-sm text-zinc-500 mt-2">
                            Ödeme geçmişi, teklifler ve bekleyen bakiyelerinizi yönetin.
                        </p>
                    </InteractiveCard>
                </Link>

                {/* Cal.com Booking Card */}
                <BookingCard />
            </div>
        </div>
    )
}
