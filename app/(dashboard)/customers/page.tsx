import { Suspense } from "react"
import { CustomerList } from "@/components/modules/crm/customer-list"
import { AddCustomerDialog } from "@/components/modules/crm/add-customer-dialog"
import { Skeleton } from "@/components/ui/skeleton"

export default function CustomersPage() {
    return (
        <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Müşteri Yönetimi</h1>
                <AddCustomerDialog />
            </div>

            <Suspense fallback={<CustomerListSkeleton />}>
                <CustomerList />
            </Suspense>
        </div>
    )
}

function CustomerListSkeleton() {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
                <div key={i} className="h-[200px] rounded-xl border bg-card text-card-foreground shadow" />
            ))}
        </div>
    )
}
