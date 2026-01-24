import { getExpenses } from "@/app/actions/finance"
import { ExpenseDialog } from "@/components/modules/finance/expense-dialog"
import { ExpenseList } from "@/components/modules/finance/expense-list"
import { Wallet } from "lucide-react"

export default async function ExpensesPage() {
    const expenses = await getExpenses()

    // Toplam Gider Hesapla
    const totalExpenses = expenses.reduce((sum: number, item: any) => sum + item.amount, 0)

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gider Yönetimi</h1>
                    <p className="text-muted-foreground">
                        İşletme harcamalarınızı takip edin.
                    </p>
                </div>
                <ExpenseDialog />
            </div>

            {/* Özet Kartı */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Toplam Gider</h3>
                        <Wallet className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold text-red-500">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(totalExpenses)}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                        Tüm zamanlar
                    </p>
                </div>
            </div>

            {/* Liste */}
            <ExpenseList expenses={expenses} />
        </div>
    )
}
