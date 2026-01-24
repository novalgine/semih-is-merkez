import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { BrainCircuit } from "lucide-react"

export function CeoScore({ score }: { score: number }) {
    let color = "bg-red-500"
    let text = "Operasyonel Bataklık"

    if (score >= 30) {
        color = "bg-yellow-500"
        text = "Denge Aranıyor"
    }
    if (score >= 60) {
        color = "bg-green-500"
        text = "Stratejik Lider"
    }

    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CEO Skoru</CardTitle>
                <BrainCircuit className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{score}%</div>
                <Progress value={score} className="h-2 mt-2" indicatorClassName={color} />
                <p className="text-xs text-muted-foreground mt-2">
                    {text}
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                    (Stratejik İşler / Toplam Efor)
                </p>
            </CardContent>
        </Card>
    )
}
