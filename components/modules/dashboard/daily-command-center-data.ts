import { format } from "date-fns"

interface SupabaseLike {
  from(table: string): any
}

export async function getDailyCommandCenterData(supabase: SupabaseLike, today = new Date()) {
  const todayStr = format(today, 'yyyy-MM-dd')

  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('assigned_date', todayStr)
    .order('priority', { ascending: false })
    .order('position', { ascending: true })

  const { data: activeClients } = await supabase
    .from('customers')
    .select('id')
    .eq('status', 'active')

  const { data: nextShoot } = await supabase
    .from('shoots')
    .select('title, shoot_date')
    .gte('shoot_date', todayStr)
    .order('shoot_date', { ascending: true })
    .limit(1)
    .single()

  const { data: paidProposals } = await supabase
    .from('proposals')
    .select('total_amount')
    .eq('payment_status', 'Paid')

  const { data: expenses } = await supabase
    .from('expenses')
    .select('amount')

  const totalIncome = paidProposals?.reduce((sum: number, p: { total_amount?: number | null }) => sum + (p.total_amount || 0), 0) || 0
  const totalExpense = expenses?.reduce((sum: number, e: { amount?: number | null }) => sum + (e.amount || 0), 0) || 0

  return {
    today,
    tasks: tasks || [],
    activeClientsCount: activeClients?.length || 0,
    nextShoot,
    netWealth: totalIncome - totalExpense,
  }
}
