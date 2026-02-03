import { FinanceTable } from "@/components/modules/finance/finance-table";
import { getAllTransactions, getFinancialTotals } from "@/app/actions/finance-simple";

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
    const transactions = await getAllTransactions();
    const totals = await getFinancialTotals();

    return (
        <div className="max-w-5xl mx-auto py-8 px-4">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-white">Finans</h1>
                <p className="text-muted-foreground mt-1">Gelir ve giderlerini tek bir yerde takip et.</p>
            </div>

            <FinanceTable
                transactions={transactions}
                netWealth={totals.netWealth}
                totalIncome={totals.totalIncome}
                totalExpense={totals.totalExpense}
            />
        </div>
    );
}
