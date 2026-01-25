import { getDashboardStats } from "@/app/actions/dashboard"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, CreditCard, DollarSign, ArrowUpRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function FinancePage() {
    const stats = await getDashboardStats()

    const profitMargin = stats.approvedProposalsAmount > 0
        ? ((stats.netProfit / stats.approvedProposalsAmount) * 100).toFixed(1)
        : 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Finansal Durum</h1>
                <p className="text-muted-foreground">
                    Gelir, gider ve kârlılık analizi
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Net Profit */}
                <Card className="border-l-4 border-l-green-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Kâr</CardTitle>
                        <TrendingUp className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                            {stats.netProfit.toLocaleString('tr-TR')} ₺
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Kâr marjı: %{profitMargin}
                        </p>
                    </CardContent>
                </Card>

                {/* Income */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Onaylanan Gelir</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.approvedProposalsAmount.toLocaleString('tr-TR')} ₺
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Onaylanmış teklifler
                        </p>
                    </CardContent>
                </Card>

                {/* Expenses */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Toplam Gider</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                            {stats.totalExpenses.toLocaleString('tr-TR')} ₺
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            Kayıtlı giderler
                        </p>
                    </CardContent>
                </Card>

                {/* Pending */}
                <Card className="border-l-4 border-l-blue-500">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Bekleyen Teklifler</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {stats.pendingProposalsAmount.toLocaleString('tr-TR')} ₺
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                            {stats.pendingProposalsCount} teklif beklemede
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Detailed Breakdown */}
            <div className="grid gap-6 md:grid-cols-2">
                {/* Pending Proposals Detail */}
                <Card>
                    <CardHeader>
                        <CardTitle>Bekleyen Teklifler Detayı</CardTitle>
                        <CardDescription>
                            Onay bekleyen kritik teklifler
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {stats.pendingProposalsDetails.length > 0 ? (
                            <div className="space-y-3">
                                {stats.pendingProposalsDetails.map((proposal, index) => (
                                    <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                                        <div>
                                            <p className="font-medium">{proposal.customer}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {proposal.daysPending} gündür bekliyor
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold">{proposal.amount.toLocaleString('tr-TR')} ₺</p>
                                        </div>
                                    </div>
                                ))}
                                <Link href="/proposals">
                                    <Button variant="outline" className="w-full gap-2">
                                        Tüm Teklifleri Gör <ArrowUpRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-8">
                                Bekleyen kritik teklif yok
                            </p>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Hızlı İşlemler</CardTitle>
                        <CardDescription>
                            Sık kullanılan finansal işlemler
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <Link href="/finance/expenses">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <CreditCard className="h-4 w-4" />
                                Gider Ekle
                            </Button>
                        </Link>
                        <Link href="/proposals">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <DollarSign className="h-4 w-4" />
                                Teklifleri Görüntüle
                            </Button>
                        </Link>
                        <Link href="/proposals/create">
                            <Button variant="outline" className="w-full justify-start gap-2">
                                <TrendingUp className="h-4 w-4" />
                                Yeni Teklif Oluştur
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
