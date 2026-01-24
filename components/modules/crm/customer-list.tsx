import { createClient } from "@/lib/supabase/server"
import { CustomerCard } from "./customer-card"

export async function CustomerList() {
    const supabase = await createClient()
    const { data: customers } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

    if (!customers?.length) {
        return (
            <div className="flex h-[200px] w-full flex-col items-center justify-center rounded-lg border border-dashed text-muted-foreground">
                <p>Henüz müşteri eklenmemiş.</p>
            </div>
        )
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {customers.map((customer) => (
                <CustomerCard key={customer.id} customer={customer} />
            ))}
        </div>
    )
}
