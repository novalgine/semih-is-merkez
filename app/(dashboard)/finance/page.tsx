import { createClient } from "@/lib/supabase/server";
import { FinanceClient } from "@/components/modules/finance/finance-client";
import { getFinancialBigPicture } from "@/app/actions/finance";

export const dynamic = 'force-dynamic';

export default async function FinancePage() {
    let netWealth = 0;
    let monthlyIncome = 0;
    let monthlyExpense = 0;
    let allTransactions: any[] = [];
    let expenseTemplates: any[] = [];
    let incomeTemplates: any[] = [];
    let incomes: any[] = [];
    let chartData: any[] = [];

    try {
        const supabase = await createClient();

        // 1. Fetch Paid Proposals (Legacy Income)
        const { data: proposals } = await supabase
            .from('proposals')
            .select('id, total_amount, payment_status, created_at, title')
            .eq('payment_status', 'Paid');

        // 2. Fetch All Confirmed Expenses
        const { data: expenses } = await supabase
            .from('expenses')
            .select('id, amount, date, category, description, status')
            .eq('status', 'confirmed');

        // 3. Fetch Dedicated Incomes
        const { data: manualIncomes } = await supabase
            .from('incomes')
            .select('*, customers(name)');

        incomes = manualIncomes || [];

        // 4. Fetch Templates
        const { data: expTemplates } = await supabase.from('expense_templates').select('*');
        const { data: incTemplates } = await supabase.from('income_templates').select('*, customers(name)');

        expenseTemplates = expTemplates || [];
        incomeTemplates = incTemplates || [];

        // 5. Fetch Chart Data
        chartData = await getFinancialBigPicture(6);

        const now = new Date();
        const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        // --- Calculations ---

        const totalProposalIncome = proposals?.reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;
        const totalManualIncome = manualIncomes?.reduce((sum, i) => sum + (i.amount || 0), 0) || 0;
        const totalIncome = totalProposalIncome + totalManualIncome;

        const totalExpense = expenses?.reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

        netWealth = totalIncome - totalExpense;

        // Monthly Stats
        const mProposalIncome = proposals?.filter(p => {
            const date = new Date(p.created_at);
            return date >= thisMonthStart && date <= thisMonthEnd;
        }).reduce((sum, p) => sum + (p.total_amount || 0), 0) || 0;

        const mManualIncome = manualIncomes?.filter(i => {
            const date = new Date(i.date);
            return date >= thisMonthStart && date <= thisMonthEnd;
        }).reduce((sum, i) => sum + (i.amount || 0), 0) || 0;

        monthlyIncome = mProposalIncome + mManualIncome;

        monthlyExpense = expenses?.filter(e => {
            const date = new Date(e.date);
            return date >= thisMonthStart && date <= thisMonthEnd;
        }).reduce((sum, e) => sum + (e.amount || 0), 0) || 0;

        // --- Combine Transactions ---

        const incomeTrans = [
            ...(proposals || []).map(p => ({
                id: p.id,
                type: 'INCOME' as const,
                amount: p.total_amount || 0,
                date: new Date(p.created_at),
                category: 'Teklif',
                description: p.title || 'Teklif ödemesi',
            })),
            ...(manualIncomes || []).map(i => ({
                id: i.id,
                type: 'INCOME' as const,
                amount: i.amount || 0,
                date: new Date(i.date),
                category: i.category || 'Diğer Gelir',
                description: i.description || 'Gelir kaydı',
            }))
        ];

        const expenseTrans = (expenses || []).map(e => ({
            id: e.id,
            type: 'EXPENSE' as const,
            amount: e.amount || 0,
            date: new Date(e.date),
            category: e.category || 'Gider',
            description: e.description || 'Gider kaydı',
        }));

        allTransactions = [...incomeTrans, ...expenseTrans]
            .sort((a, b) => b.date.getTime() - a.date.getTime())
            .slice(0, 15);

    } catch (error) {
        console.error('Finance data fetch error:', error);
    }

    return (
        <FinanceClient
            netWealth={netWealth}
            monthlyIncome={monthlyIncome}
            monthlyExpense={monthlyExpense}
            transactions={allTransactions}
            expenseTemplates={expenseTemplates}
            incomeTemplates={incomeTemplates}
            incomes={incomes}
            chartData={chartData}
        />
    );
}
