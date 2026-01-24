"use client"

import { Copy, Plus, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"

const SNIPPETS = [
    {
        id: "tanitim-filmi",
        title: "Tanıtım Filmi Paketi",
        content: "Kurumsal kimliğinizi yansıtan, 4K çözünürlükte, profesyonel kurgu ve renk düzenlemesi içeren 1-2 dakikalık tanıtım filmi. Drone çekimleri ve lisanslı müzik dahildir."
    },
    {
        id: "sosyal-medya",
        title: "Sosyal Medya Reels (5'li)",
        content: "Instagram ve TikTok için optimize edilmiş, dikey formatta 5 adet 15-30 saniyelik Reels videosu. Trend müzikler ve dinamik kurgu."
    },
    {
        id: "etkinlik",
        title: "Etkinlik Hikayesi",
        content: "Etkinliğinizin en özel anlarını yakalayan, gün boyu çekim ve aynı gün teslim (SDE) seçeneğiyle etkinlik özet videosu."
    },
    {
        id: "banka",
        title: "Banka Bilgileri",
        content: "Alıcı: Semih İş Merkezi\nIBAN: TR12 3456 7890 1234 5678 90\nBanka: Enpara.com\nAçıklama: Proje Adı"
    },
    {
        id: "teklif-notu",
        title: "Standart Teklif Notu",
        content: "Bu teklif 15 gün süreyle geçerlidir. Fiyatlara KDV dahil değildir. Ödemenin %50'si iş başlangıcında, kalanı teslimatta alınır."
    }
]

interface SnippetBankProps {
    onInsert?: (text: string) => void
}

export function SnippetBank({ onInsert }: SnippetBankProps) {
    const { toast } = useToast()

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text)
        toast({
            title: "Kopyalandı",
            description: "Metin panoya kopyalandı.",
        })
    }

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                    <FileText className="h-4 w-4" />
                    Şablon Bankası
                </Button>
            </SheetTrigger>
            <SheetContent>
                <SheetHeader>
                    <SheetTitle>Şablon Bankası</SheetTitle>
                    <SheetDescription>
                        Sık kullandığınız metinleri buradan hızlıca kopyalayın veya ekleyin.
                    </SheetDescription>
                </SheetHeader>
                <ScrollArea className="h-[calc(100vh-100px)] mt-4 pr-4">
                    <div className="space-y-4">
                        {SNIPPETS.map((snippet) => (
                            <Card key={snippet.id} className="bg-muted/50">
                                <CardHeader className="p-4 pb-2">
                                    <CardTitle className="text-sm font-medium flex justify-between items-center">
                                        {snippet.title}
                                        <div className="flex gap-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6"
                                                onClick={() => handleCopy(snippet.content)}
                                                title="Kopyala"
                                            >
                                                <Copy className="h-3 w-3" />
                                            </Button>
                                            {onInsert && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6"
                                                    onClick={() => onInsert(snippet.content)}
                                                    title="Ekle"
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            )}
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="p-4 pt-0">
                                    <CardDescription className="text-xs mt-2 line-clamp-3">
                                        {snippet.content}
                                    </CardDescription>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    )
}
