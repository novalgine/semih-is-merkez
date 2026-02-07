import test from 'node:test'
import assert from 'node:assert/strict'
import { getDailyCommandCenterData } from '../../components/modules/dashboard/daily-command-center-data'
import { createMockSupabase } from './helpers/mock-supabase'

test('getDailyCommandCenterData aggregates deterministic dashboard data', async () => {
  const supabase = createMockSupabase({
    tasks: [
      { id: 'a', assigned_date: '2026-02-07', priority: 'high', position: 2 },
      { id: 'b', assigned_date: '2026-02-07', priority: 'low', position: 1 },
      { id: 'c', assigned_date: '2026-02-06', priority: 'high', position: 1 },
    ],
    customers: [{ id: 'c1', status: 'active' }, { id: 'c2', status: 'inactive' }],
    shoots: [
      { title: 'Old', shoot_date: '2026-02-06' },
      { title: 'Next', shoot_date: '2026-02-09' },
      { title: 'Later', shoot_date: '2026-02-11' },
    ],
    proposals: [{ total_amount: 1000, payment_status: 'Paid' }, { total_amount: 250, payment_status: 'Unpaid' }],
    expenses: [{ amount: 300 }, { amount: 50 }],
  })

  const data = await getDailyCommandCenterData(supabase as any, new Date('2026-02-07'))

  assert.equal(data.tasks.length, 2)
  assert.equal(data.activeClientsCount, 1)
  assert.equal(data.nextShoot?.title, 'Next')
  assert.equal(data.netWealth, 650)
})
