"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Clock, CheckCircle2 } from "lucide-react"

interface IncomeChartProps {
    approved: number
    pending: number
}

export function IncomeChart({ approved, pending }: IncomeChartProps) {
    const total = approved + pending
    const approvedPercentage = total > 0 ? (approved / total) * 100 : 0
    const pendingPercentage = total > 0 ? (pending / total) * 100 : 0

    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    Gelir Durumu
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Total */}
                    <div>
                        <div className="text-2xl font-bold">{total.toLocaleString('tr-TR')} ₺</div>
                        <p className="text-xs text-muted-foreground">Toplam Potansiyel Ciro</p>
                    </div>

                    {/* Visual Bar */}
                    <div className="h-4 w-full bg-muted rounded-full overflow-hidden flex">
                        <div
                            className="h-full bg-green-500 transition-all duration-500"
                            style={{ width: `${approvedPercentage}%` }}
                        />
                        <div
                            className="h-full bg-yellow-500 transition-all duration-500"
                            style={{ width: `${pendingPercentage}%` }}
                        />
                    </div>

                    {/* Legend / Details */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <CheckCircle2 className="h-3 w-3 text-green-500" />
                                Onaylanan
                            </div>
                            <div className="font-semibold text-sm">{approved.toLocaleString('tr-TR')} ₺</div>
                            <div className="text-xs text-muted-foreground">%{approvedPercentage.toFixed(1)}</div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 text-yellow-500" />
                                Bekleyen
                            </div>
                            <div className="font-semibold text-sm">{pending.toLocaleString('tr-TR')} ₺</div>
                            <div className="text-xs text-muted-foreground">%{pendingPercentage.toFixed(1)}</div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
