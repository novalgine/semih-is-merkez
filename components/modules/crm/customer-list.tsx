import { createClient } from "@/lib/supabase/server"
import { CustomerListClient } from "./customer-list-client"

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

    return <CustomerListClient customers={customers} />
}
