import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Calendar, Building2, User, Mail, Phone } from "lucide-react"
import { format } from "date-fns"
import { tr } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { getProposal } from "@/app/actions/proposals"
import { ProposalActions } from "@/components/modules/proposals/proposal-actions"


type ProposalItem = {
    id: string
    description: string
    quantity: number
    unit_price: number
}

export default async function ProposalDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const proposal = await getProposal(id)

    if (!proposal) {
        notFound()
    }

    // Calculate precise totals
    const subtotal = proposal.proposal_items.reduce((sum: number, item: ProposalItem) => sum + (item.quantity * item.unit_price), 0)
    const tax = subtotal * (proposal.tax_rate / 100)
    const total = subtotal + tax

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-2">
                    <Link href="/proposals">
                        <Button variant="ghost" size="icon">
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">{proposal.project_title}</h1>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Badge variant={proposal.status === 'Approved' ? 'default' : 'secondary'}>
                                {proposal.status === 'Approved' ? 'Onaylandı' :
                                    proposal.status === 'Sent' ? 'Gönderildi' : 'Taslak'}
                            </Badge>
                            <span>•</span>
                            <span>{format(new Date(proposal.created_at), 'd MMMM yyyy', { locale: tr })}</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <ProposalActions id={proposal.id} status={proposal.status} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="md:col-span-2 space-y-6">
                    {/* Items Table */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Hizmet Detayları</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="relative w-full overflow-auto">
                                <table className="w-full caption-bottom text-sm">
                                    <thead className="[&_tr]:border-b">
                                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                            <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Açıklama</th>
                                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Miktar</th>
                                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Birim Fiyat</th>
                                            <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Toplam</th>
                                        </tr>
                                    </thead>
                                    <tbody className="[&_tr:last-child]:border-0">
                                        {proposal.proposal_items.map((item: ProposalItem) => (
                                            <tr key={item.id} className="border-b transition-colors hover:bg-muted/50">
                                                <td className="p-4 align-middle">{item.description}</td>
                                                <td className="p-4 align-middle text-right">{item.quantity}</td>
                                                <td className="p-4 align-middle text-right">{item.unit_price.toLocaleString('tr-TR')} ₺</td>
                                                <td className="p-4 align-middle text-right font-medium">
                                                    {(item.quantity * item.unit_price).toLocaleString('tr-TR')} ₺
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Totals */}
                            <div className="p-4 flex flex-col items-end gap-2 border-t bg-muted/10">
                                <div className="flex justify-between w-full sm:w-1/2 text-sm">
                                    <span className="text-muted-foreground">Ara Toplam:</span>
                                    <span>{subtotal.toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <div className="flex justify-between w-full sm:w-1/2 text-sm">
                                    <span className="text-muted-foreground">KDV (%{proposal.tax_rate}):</span>
                                    <span>{tax.toLocaleString('tr-TR')} ₺</span>
                                </div>
                                <Separator className="my-2 w-full sm:w-1/2" />
                                <div className="flex justify-between w-full sm:w-1/2 font-bold text-lg">
                                    <span>Genel Toplam:</span>
                                    <span>{total.toLocaleString('tr-TR')} ₺</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notes */}
                    {proposal.notes && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-base">Notlar</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{proposal.notes}</p>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Sidebar: Customer Info */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <User className="h-4 w-4" />
                                Müşteri Bilgileri
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 text-sm">
                            <div>
                                <div className="font-medium">{proposal.customers?.name}</div>
                                {proposal.customers?.company && (
                                    <div className="flex items-center gap-2 text-muted-foreground mt-1">
                                        <Building2 className="h-3 w-3" />
                                        {proposal.customers.company}
                                    </div>
                                )}
                            </div>
                            <Separator />
                            <div className="space-y-2">
                                {proposal.customers?.email && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Mail className="h-3 w-3" />
                                        <a href={`mailto:${proposal.customers.email}`} className="hover:text-primary transition-colors">
                                            {proposal.customers.email}
                                        </a>
                                    </div>
                                )}
                                {proposal.customers?.phone && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Phone className="h-3 w-3" />
                                        <a href={`tel:${proposal.customers.phone}`} className="hover:text-primary transition-colors">
                                            {proposal.customers.phone}
                                        </a>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-base flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                Geçerlilik
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Son Geçerlilik:</span>
                                <span className="font-medium">
                                    {proposal.valid_until ? format(new Date(proposal.valid_until), 'd MMMM yyyy', { locale: tr }) : "-"}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
