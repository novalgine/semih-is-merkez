'use client'

import Link from "next/link"
import { Building2, Mail, Phone, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EditCustomerDialog } from "./edit-customer-dialog"
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { deleteCustomer } from "@/app/actions/customers"
import { useToast } from "@/hooks/use-toast"

interface Customer {
    id: string
    name: string
    company: string | null
    email: string | null
    phone: string | null
    status: 'active' | 'lead' | 'passive'
    image_url: string | null
}

export function CustomerCard({ customer }: { customer: Customer }) {
    const { toast } = useToast()

    const handleDelete = async () => {
        const result = await deleteCustomer(customer.id)
        if (result.success) {
            toast({ title: "Müşteri Silindi", description: "Müşteri başarıyla silindi." })
        } else {
            toast({ title: "Hata", description: "Müşteri silinemedi.", variant: "destructive" })
        }
    }

    return (
        <Card className="overflow-hidden transition-all hover:shadow-md group">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-semibold">{customer.name}</CardTitle>
                    <Badge variant={
                        customer.status === 'active' ? 'default' :
                            customer.status === 'lead' ? 'secondary' : 'outline'
                    }>
                        {customer.status === 'active' ? 'Aktif' :
                            customer.status === 'lead' ? 'Potansiyel' : 'Pasif'}
                    </Badge>
                </div>
                {customer.company && (
                    <div className="flex items-center text-sm text-muted-foreground">
                        <Building2 className="mr-1 h-3 w-3" />
                        {customer.company}
                    </div>
                )}
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{customer.email || "-"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    <span>{customer.phone || "-"}</span>
                </div>
            </CardContent>
            <CardFooter className="bg-muted/50 p-2 flex justify-between items-center">
                <div className="flex gap-2">
                    <Button asChild variant="ghost" size="sm" className="h-8">
                        <Link href={`/customers/${customer.id}`}>Detay</Link>
                    </Button>
                    <EditCustomerDialog customer={customer} />
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Müşteriyi Sil</AlertDialogTitle>
                            <AlertDialogDescription>
                                Bu işlem geri alınamaz. <b>{customer.name}</b> adlı müşteriyi ve ilgili tüm verileri silmek istediğinize emin misiniz?
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>İptal</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                Sil
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </CardFooter>
        </Card>
    )
}
