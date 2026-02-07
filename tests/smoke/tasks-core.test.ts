import test from 'node:test'
import assert from 'node:assert/strict'
import { createTaskActions } from '../../app/actions/tasks-core'
import { createMockSupabase } from './helpers/mock-supabase'

test('task create/update/delete/reorder flow works deterministically with mock supabase', async () => {
  const supabase = createMockSupabase({
    tasks: [
      { id: 't1', content: 'First', assigned_date: '2026-02-07', position: 0, is_completed: false, priority: 'medium', category: null, description: null, created_at: '2026-02-01' },
      { id: 't2', content: 'Second', assigned_date: null, position: 1, is_completed: false, priority: 'low', category: null, description: null, created_at: '2026-02-02' },
    ],
  })
  const revalidated: string[] = []
  const actions = createTaskActions(supabase as any, (path) => revalidated.push(path))

  const created = await actions.createTask('New Task', '2026-02-07', 'ops', 'high', 'desc')
  assert.equal(created.success, true)
  assert.equal(supabase.tables.tasks.length, 3)

  const updated = await actions.updateTask({ id: 't1', updates: { content: 'Updated', assigned_date: new Date('2026-02-08') as any } })
  assert.equal(updated.success, true)
  assert.equal(supabase.tables.tasks.find((t) => t.id === 't1')?.content, 'Updated')
  assert.equal(supabase.tables.tasks.find((t) => t.id === 't1')?.assigned_date, '2026-02-08')

  const reordered = await actions.reorderTasks([
    { id: 't1', position: 9, assigned_date: '2026-02-10' },
    { id: 't2', position: 4, assigned_date: null },
  ])
  assert.equal(reordered.success, true)
  assert.equal(supabase.tables.tasks.find((t) => t.id === 't1')?.position, 9)

  const deleted = await actions.deleteTask('t2', '/dashboard')
  assert.equal(deleted.success, true)

  const tasksInRange = await actions.getTasks(new Date('2026-02-07'), new Date('2026-02-11'))
  assert.ok(tasksInRange.some((t) => t.id === 't1'))
  assert.ok(tasksInRange.some((t) => t.id !== 't2'))

  assert.ok(revalidated.includes('/daily'))
  assert.ok(revalidated.includes('/'))
  assert.ok(revalidated.includes('/dashboard'))
})
