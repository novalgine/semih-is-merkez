import { startOfWeek, endOfWeek } from "date-fns"
import { getTasks } from "@/app/actions/tasks"
import { WeeklyBoard } from "@/components/modules/tasks/weekly-board"

interface DailyPageProps {
    searchParams: Promise<{ date?: string }>
}

export default async function DailyPage({ searchParams }: DailyPageProps) {
    const { date } = await searchParams

    // URL'den tarih gelirse onu kullan, yoksa bugünü kullan
    const currentDate = date ? new Date(date) : new Date()

    // Haftanın başlangıç ve bitiş tarihlerini hesapla (Pazartesi'den başlar)
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 })
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 })

    // Görevleri getir
    const tasks = await getTasks(startDate, endDate)

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col">
            <div className="mb-4">
                <h1 className="text-3xl font-bold tracking-tight">Haftalık Plan</h1>
                <p className="text-muted-foreground">
                    Görevleri sürükleyip bırakarak haftanızı planlayın.
                </p>
            </div>

            <div className="flex-1 min-h-0">
                <WeeklyBoard initialTasks={tasks} currentDate={currentDate} />
            </div>
        </div>
    )
}
