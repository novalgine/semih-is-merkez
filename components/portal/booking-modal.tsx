"use client";

import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CalendarDays } from "lucide-react";
import Cal, { getCalApi } from "@calcom/embed-react";
import { useEffect } from "react";
import { InteractiveCard } from "@/components/ui/interactive-card";

export function BookingCard() {
    useEffect(() => {
        (async function () {
            const cal = await getCalApi();
            cal("ui", {
                theme: "auto",
                styles: {
                    branding: {
                        brandColor: "#F59E0B"
                    }
                },
                hideEventTypeDetails: false,
                layout: "month_view"
            });
        })();
    }, []);

    return (
        <Dialog>
            <DialogTrigger asChild>
                <div className="h-full">
                    <InteractiveCard className="group flex flex-col justify-between p-6 rounded-2xl bg-card border border-border hover:border-amber-500/50 transition-all h-full text-left cursor-pointer hover:shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                        <div className="h-10 w-10 rounded-full bg-amber-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <CalendarDays className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-foreground group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">Toplantı Planla</h3>
                            <p className="text-sm text-muted-foreground mt-1">Yeni projeler için takvimden yer seçin.</p>
                        </div>
                    </InteractiveCard>
                </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[900px] h-[700px] bg-background border-border p-0 overflow-hidden">
                <Cal
                    calLink="semihhasanoglu/30min"
                    style={{ width: "100%", height: "100%", overflow: "scroll" }}
                    config={{ theme: "auto" }}
                />
            </DialogContent>
        </Dialog>
    );
}
