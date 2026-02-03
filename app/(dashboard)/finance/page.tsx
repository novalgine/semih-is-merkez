import { FinanceTable } from "@/components/modules/finance/finance-table";
import { getAllTransactions, getFinancialTotals, addTransaction, deleteTransaction } from "@/app/actions/finance-simple";

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
    const transactions = await getAllTransactions();
    const totals = await getFinancialTotals();

    async function handleAdd(data: {
        type: 'income' | 'expense';
        amount: number;
        date: string;
        category: string;
        description: string;
    }) {
        'use server';
        return addTransaction(data);
    }

    async function handleDelete(id: string) {
        'use server';
        // We need to find the transaction type to delete from correct table
        const tx = transactions.find(t => t.id === id);
        if (!tx) return { success: false };
        return deleteTransaction(id, tx.type);
    }

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
                onAdd={handleAdd}
                onDelete={handleDelete}
            />
        </div>
    );
}
