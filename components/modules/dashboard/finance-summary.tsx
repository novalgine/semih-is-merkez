"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Wallet, AlertCircle } from "lucide-react"

interface FinanceSummaryProps {
    income: number
    expenses: number
    netProfit: number
}

export function FinanceSummary({ income, expenses, netProfit }: FinanceSummaryProps) {
    const isProfitable = netProfit >= 0
    const profitMargin = income > 0 ? (netProfit / income) * 100 : 0

    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow h-full">
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-primary" />
                    Finansal Durum
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {/* Net Profit (Hero) */}
                    <div>
                        <div className={`text-3xl font-bold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                            {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(netProfit)}
                        </div>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                            Net Kar
                            {isProfitable ? (
                                <span className="text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full text-[10px] font-medium">
                                    %{profitMargin.toFixed(1)} Marj
                                </span>
                            ) : (
                                <span className="text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1">
                                    <AlertCircle className="h-3 w-3" /> Kritik
                                </span>
                            )}
                        </p>
                    </div>

                    {/* Breakdown */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t">
                        <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <TrendingUp className="h-3 w-3 text-green-500" />
                                Gelir
                            </div>
                            <div className="font-semibold text-sm">
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(income)}
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <TrendingDown className="h-3 w-3 text-red-500" />
                                Gider
                            </div>
                            <div className="font-semibold text-sm">
                                {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(expenses)}
                            </div>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
