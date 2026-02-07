export type TableRows = Record<string, Record<string, any>[]>

export function createMockSupabase(initial: TableRows = {}) {
  const tables: TableRows = Object.fromEntries(
    Object.entries(initial).map(([name, rows]) => [name, rows.map((r) => ({ ...r }))])
  )

  const history: Array<{ table: string; action: string; payload?: any }> = []

  class Query {
    table: string
    rows: Record<string, any>[]
    private resultRows: Record<string, any>[]
    private pendingUpdate?: Record<string, any>
    private pendingDelete = false
    private insertRows?: Record<string, any>[]

    constructor(table: string) {
      this.table = table
      this.rows = tables[table] || []
      tables[table] = this.rows
      this.resultRows = [...this.rows]
    }

    select() {
      history.push({ table: this.table, action: 'select' })
      return this
    }

    insert(values: Record<string, any>) {
      history.push({ table: this.table, action: 'insert', payload: values })
      const row = { id: values.id || `id-${this.rows.length + 1}`, ...values }
      this.rows.push(row)
      this.insertRows = [row]
      this.resultRows = [row]
      return this
    }

    update(values: Record<string, any>) {
      history.push({ table: this.table, action: 'update', payload: values })
      this.pendingUpdate = values
      return this
    }

    delete() {
      history.push({ table: this.table, action: 'delete' })
      this.pendingDelete = true
      return this
    }

    eq(column: string, value: any) {
      if (this.pendingUpdate) {
        this.rows.forEach((r) => {
          if (r[column] === value) Object.assign(r, this.pendingUpdate)
        })
      } else if (this.pendingDelete) {
        for (let i = this.rows.length - 1; i >= 0; i -= 1) {
          if (this.rows[i][column] === value) this.rows.splice(i, 1)
        }
        this.resultRows = []
      } else {
        this.resultRows = this.resultRows.filter((r) => r[column] === value)
      }
      return this
    }

    gte(column: string, value: any) {
      this.resultRows = this.resultRows.filter((r) => r[column] >= value)
      return this
    }

    or(filter: string) {
      const matched = /assigned_date\.gte\.([\d-]+),assigned_date\.lte\.([\d-]+)/.exec(filter)
      if (matched) {
        const [, start, end] = matched
        this.resultRows = this.rows.filter((r) => !r.assigned_date || (r.assigned_date >= start && r.assigned_date <= end))
      }
      return this
    }

    order(column: string, options: { ascending: boolean }) {
      const dir = options.ascending ? 1 : -1
      this.resultRows.sort((a, b) => (a[column] > b[column] ? dir : a[column] < b[column] ? -dir : 0))
      return this
    }

    limit(count: number) {
      this.resultRows = this.resultRows.slice(0, count)
      return this
    }

    single() {
      return Promise.resolve({ data: this.resultRows[0] || null, error: null })
    }

    then(resolve: (value: { data: any; error: null }) => any) {
      return Promise.resolve(resolve({ data: this.resultRows, error: null }))
    }
  }

  return {
    history,
    tables,
    from(table: string) {
      return new Query(table)
    },
  }
}
