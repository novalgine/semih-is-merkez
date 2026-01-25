import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Building2, Mail, Phone, Calendar } from "lucide-react"
import { AiChat } from "@/components/modules/crm/ai-chat"
import { TimelineView } from "@/components/modules/crm/timeline-view"
import { ProjectList } from "@/components/modules/crm/project-list"
import { EditCustomerDialog } from "@/components/modules/crm/edit-customer-dialog"
import { getCustomerTimeline } from "@/app/actions/customers"

import { PortalManager } from "@/components/modules/crm/portal-manager"

export default async function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const supabase = await createClient()

    const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single()

    if (!customer) {
        notFound()
    }

    // Fetch timeline (Proposals, Shoots, Interactions)
    const timeline = await getCustomerTimeline(id)

    // Fetch projects (will be empty if table doesn't exist yet, handled gracefully)
    const { data: projects } = await supabase
        .from('projects')
        .select('*')
        .eq('customer_id', id)
        .order('created_at', { ascending: false })

    return (
        <div className="flex flex-col gap-6">
            {/* Header Section */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border">
                        <AvatarImage src={customer.image_url || undefined} />
                        <AvatarFallback className="text-lg">{customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-2xl font-bold">{customer.name}</h1>
                        <div className="flex items-center gap-2 text-muted-foreground">
                            <Building2 className="h-4 w-4" />
                            <span>{customer.company || "Şirket bilgisi yok"}</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                        {customer.status.toUpperCase()}
                    </Badge>
                    <EditCustomerDialog customer={customer} />
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column: Contact Info + Portal Manager */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>İletişim Bilgileri</CardTitle>
                        </CardHeader>
                        <CardContent className="grid gap-4">
                            <div className="flex items-center gap-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{customer.email || "-"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{customer.phone || "-"}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Kayıt: {new Date(customer.created_at).toLocaleDateString('tr-TR')}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Portal Manager */}
                    <PortalManager
                        customerId={customer.id}
                        currentToken={customer.portal_token}
                        currentPin={customer.portal_pin}
                    />
                </div>

                {/* Right Column: Main Content Tabs */}
                <Tabs defaultValue="timeline" className="w-full">
                    <TabsList>
                        <TabsTrigger value="timeline">Zaman Çizelgesi</TabsTrigger>
                        <TabsTrigger value="projects">Projeler</TabsTrigger>
                        <TabsTrigger value="ai-insight">AI Analizi</TabsTrigger>
                    </TabsList>
                    <TabsContent value="timeline" className="mt-4">
                        <TimelineView customerId={customer.id} items={timeline || []} />
                    </TabsContent>
                    <TabsContent value="projects" className="mt-4">
                        <ProjectList customerId={customer.id} projects={projects || []} />
                    </TabsContent>
                    <TabsContent value="ai-insight" className="mt-4">
                        <AiChat customerId={customer.id} customerName={customer.name} />
                    </TabsContent>
                </Tabs>
            </div>
        </div >
    )
}
