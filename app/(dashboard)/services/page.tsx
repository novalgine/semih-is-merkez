import { getServices } from "@/app/actions/services"
import { getBundles } from "@/app/actions/bundles"
import { ServiceDialog } from "@/components/modules/services/service-dialog"
import { BundleDialog } from "@/components/modules/services/bundle-dialog"
import { DeleteServiceButton } from "@/components/modules/services/delete-service-button"
import { DeleteBundleButton } from "@/components/modules/services/delete-bundle-button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Edit, Package, Layers } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function ServicesPage() {
    const [services, bundles] = await Promise.all([
        getServices(),
        getBundles()
    ])

    return (
        <div className="flex flex-col gap-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Hizmetler ve Paketler</h1>
                <p className="text-muted-foreground">
                    Hizmetlerinizi ve paketlerinizi yönetin.
                </p>
            </div>

            <Tabs defaultValue="services" className="w-full">
                <TabsList>
                    <TabsTrigger value="services">Hizmetler</TabsTrigger>
                    <TabsTrigger value="bundles">Paketler</TabsTrigger>
                </TabsList>

                <TabsContent value="services" className="space-y-4">
                    <div className="flex justify-end">
                        <ServiceDialog />
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Hizmet Listesi</CardTitle>
                            <CardDescription>
                                Tekliflerde kullanabileceğiniz hizmet kalemleri.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {services.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                    <Package className="h-12 w-12 mb-4 opacity-20" />
                                    <p>Henüz kayıtlı hizmet yok.</p>
                                    <p className="text-sm">Yeni bir hizmet ekleyerek başlayın.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Hizmet Adı</TableHead>
                                            <TableHead>Açıklama</TableHead>
                                            <TableHead>Birim Fiyat</TableHead>
                                            <TableHead>Birim</TableHead>
                                            <TableHead className="text-right">İşlemler</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {services.map((service) => (
                                            <TableRow key={service.id}>
                                                <TableCell className="font-medium">{service.name}</TableCell>
                                                <TableCell className="text-muted-foreground text-sm max-w-[300px] truncate">
                                                    {service.description || "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {service.price ? `${service.price.toLocaleString('tr-TR')} TL` : "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {service.unit || "-"}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end items-center gap-2">
                                                        <ServiceDialog
                                                            service={service}
                                                            trigger={
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            }
                                                        />
                                                        <DeleteServiceButton id={service.id} name={service.name} />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="bundles" className="space-y-4">
                    <div className="flex justify-end">
                        <BundleDialog />
                    </div>
                    <Card>
                        <CardHeader>
                            <CardTitle>Paket Listesi</CardTitle>
                            <CardDescription>
                                Birden fazla hizmeti içeren hazır paketler.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {bundles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                                    <Layers className="h-12 w-12 mb-4 opacity-20" />
                                    <p>Henüz kayıtlı paket yok.</p>
                                    <p className="text-sm">Yeni bir paket oluşturarak başlayın.</p>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Paket Adı</TableHead>
                                            <TableHead>Açıklama</TableHead>
                                            <TableHead>Toplam Fiyat</TableHead>
                                            <TableHead>İçerik</TableHead>
                                            <TableHead className="text-right">İşlemler</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {bundles.map((bundle: any) => (
                                            <TableRow key={bundle.id}>
                                                <TableCell className="font-medium">{bundle.name}</TableCell>
                                                <TableCell className="text-muted-foreground text-sm max-w-[300px] truncate">
                                                    {bundle.description || "-"}
                                                </TableCell>
                                                <TableCell>
                                                    {bundle.price ? `${bundle.price.toLocaleString('tr-TR')} TL` : "-"}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground">
                                                    {bundle.bundle_items?.length || 0} Hizmet
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end items-center gap-2">
                                                        <BundleDialog
                                                            bundle={bundle}
                                                            trigger={
                                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                            }
                                                        />
                                                        <DeleteBundleButton id={bundle.id} name={bundle.name} />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}
