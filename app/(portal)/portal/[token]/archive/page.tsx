import { notFound } from "next/navigation"
import { format } from "date-fns"
import { tr } from "date-fns/locale"
import { FileVideo, FileImage, FileText, Download, ExternalLink } from "lucide-react"

export const dynamic = 'force-dynamic'

import { getPortalCustomer, getPortalDeliverables } from "@/app/actions/portal-public"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface PageProps {
    params: Promise<{
        token: string
    }>
}

export default async function PortalArchivePage({ params }: PageProps) {
    const { token } = await params
    let customer = null
    try {
        customer = await getPortalCustomer(token)
    } catch (error) {
        console.error("Failed to fetch customer:", error)
    }
    if (!customer) return notFound()

    let deliverables: any[] = []
    try {
        deliverables = await getPortalDeliverables(token)
    } catch (error) {
        console.error("Failed to fetch deliverables:", error)
    }

    const getIcon = (type: string) => {
        switch (type) {
            case 'video': return <FileVideo className="h-8 w-8 text-blue-500" />
            case 'photo': return <FileImage className="h-8 w-8 text-purple-500" />
            default: return <FileText className="h-8 w-8 text-gray-500" />
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Medya Arşivi</h1>
                    <p className="text-muted-foreground">
                        Teslim edilen tüm dosyalarınız.
                    </p>
                </div>
                <Link href={`/portal/${token}`}>
                    <Button variant="outline">Geri Dön</Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {deliverables.length === 0 ? (
                    <div className="col-span-full text-center py-10 text-muted-foreground bg-muted/30 rounded-lg border border-dashed">
                        Henüz arşivlenmiş dosya bulunmuyor.
                    </div>
                ) : (
                    deliverables.map((item) => (
                        <Card key={item.id} className="group hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-start gap-4 space-y-0 pb-2">
                                <div className="bg-muted p-2 rounded-lg group-hover:bg-card transition-colors">
                                    {getIcon(item.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate" title={item.title}>
                                        {item.title}
                                    </h3>
                                    <p className="text-xs text-muted-foreground">
                                        {format(new Date(item.created_at), "d MMM yyyy", { locale: tr })}
                                    </p>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] mb-4">
                                    {item.description || "Açıklama yok."}
                                </p>
                                <div className="flex gap-2">
                                    <Button asChild className="w-full" variant="outline">
                                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Görüntüle
                                        </a>
                                    </Button>
                                    {/* İndirme butonu opsiyonel, şimdilik sadece link */}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
