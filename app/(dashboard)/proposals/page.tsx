import Link from "next/link"
import { Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { Badge } from "@/components/ui/badge"
import { DeleteProposalButton } from "@/components/modules/proposals/delete-proposal-button"

export default async function ProposalsPage() {
    const supabase = await createClient()

    // Fetch proposals with customer names
    const { data: proposals } = await supabase
        .from('proposals')
        .select(`
            *,
            customers (
                name,
                company
            )
        `)
        .order('created_at', { ascending: false })

    return (
        <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Teklifler</h1>
                    <p className="text-muted-foreground">
                        Müşterilerinize gönderdiğiniz teklifleri yönetin.
                    </p>
                </div>
                <Link href="/proposals/create">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Yeni Teklif Oluştur
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {proposals?.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-in fade-in-50">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <FileText className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="mt-4 text-lg font-semibold">Henüz teklif yok</h3>
                        <p className="mb-4 mt-2 text-sm text-muted-foreground max-w-sm">
                            İlk profesyonel teklifinizi oluşturmak için yukarıdaki butonu kullanın.
                        </p>
                        <Link href="/proposals/create">
                            <Button variant="outline">Teklif Oluştur</Button>
                        </Link>
                    </div>
                ) : (
                    proposals?.map((proposal) => (
                        <Card key={proposal.id} className="hover:bg-muted/50 transition-colors group relative">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {proposal.project_title}
                                </CardTitle>
                                <Badge variant={
                                    proposal.status === 'sent' ? 'default' :
                                        proposal.status === 'accepted' ? 'secondary' : 'outline'
                                }>
                                    {proposal.status === 'sent' ? 'Gönderildi' :
                                        proposal.status === 'accepted' ? 'Onaylandı' :
                                            proposal.status === 'draft' ? 'Taslak' : proposal.status}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">
                                    {proposal.total_amount?.toLocaleString('tr-TR')} TL
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                    {proposal.customers?.name}
                                    {proposal.customers?.company && ` - ${proposal.customers?.company}`}
                                </p>
                                <div className="mt-4 text-xs text-muted-foreground flex justify-between items-center">
                                    <div className="flex flex-col">
                                        <span>{new Date(proposal.created_at).toLocaleDateString('tr-TR')}</span>
                                        <span>Geçerlilik: {new Date(proposal.valid_until).toLocaleDateString('tr-TR')}</span>
                                    </div>
                                    <Link href={`/proposals/${proposal.id}`}>
                                        <Button variant="ghost" size="sm">Detay</Button>
                                    </Link>
                                </div>
                            </CardContent>
                            <DeleteProposalButton id={proposal.id} title={proposal.project_title} />
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
