import { createClient } from "@/lib/supabase/server";
import { FinanceClient } from "@/components/modules/finance/finance-client";

export default async function FinancePage() {
    let netWealth = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;
    let allTransactions: any[] = [];

    try {
        const supabase = await createClient();

        // 1. Fetch Paid Proposals (Income)
        const { data: proposals } = await supabase
            .from('proposals')
            .select('id, total_amount, payment_status, created_at, project_title')
            .eq('payment_status', 'Paid');

        // 2. Fetch All Expenses
        const { data: expenses } = await supabase
            .from('expenses')
            .select('id, amount, date, category, description');

        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // --- Calculations ---

        // Total Income
        const totalIncome = proposals?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;

        // Total Expense
        const totalExpense = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

        // Net Wealth
        netWealth = totalIncome - totalExpense;

        // Monthly Income
        monthlyIncome = proposals?.filter(p => {
            const date = new Date(p.created_at);
            return date >= thisMonthStart && date <= thisMonthEnd;
        }).reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;

        // Monthly Expense
        monthlyExpense = expenses?.filter(e => {
            const date = new Date(e.date);
            return date >= thisMonthStart && date <= thisMonthEnd;
        }).reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

        // --- Combine Transactions ---

        const incomeTransactions = (proposals || []).map(p => ({
            id: p.id,
            type: 'INCOME' as const,
            amount: p.total_amount || 0,
            date: new Date(p.created_at),
            category: 'Teklif',
            description: p.project_title || 'Teklif ödemesi',
        }));

        const expenseTransactions = (expenses || []).map(e => ({
            id: e.id,
            type: 'EXPENSE' as const,
            amount: e.amount || 0,
            date: new Date(e.date),
            category: e.category || 'Gider',
            description: e.description || 'Gider kaydı',
        }));

        allTransactions = [...incomeTransactions, ...expenseTransactions]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 8);

    } catch (error) {
        console.error('Finance data fetch error:', error);
    }

    return (
        <FinanceClient
            netWealth={netWealth}
            monthlyIncome={monthlyIncome}
            monthlyExpense={monthlyExpense}
            transactions={allTransactions}
        />
    );
}
