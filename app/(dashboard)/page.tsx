import { DailyCommandCenter } from "@/components/modules/dashboard/daily-command-center";

// Force dynamic rendering - tasks change frequently
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function DashboardPage() {
    return <DailyCommandCenter />;
}
