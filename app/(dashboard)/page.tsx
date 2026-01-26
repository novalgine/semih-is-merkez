import Link from "next/link"
import { getDashboardStats } from "@/app/actions/dashboard"
import { AiBriefing } from "@/components/modules/dashboard/ai-briefing"
import { TodaysTasks } from "@/components/modules/dashboard/todays-tasks"
import { DashboardClient } from "@/components/modules/dashboard/dashboard-client"

export default async function DashboardPage() {
    const stats = await getDashboardStats()

    return (
        <div className="space-y-6 pb-20">
            {/* 1. AI Briefing Section */}
            <AiBriefing stats={stats} />

            {/* 2. Bento Grid with Stagger Animation */}
            <DashboardClient stats={stats} />

            {/* 3. Today's Tasks */}
            <TodaysTasks />
        </div>
    )
}
