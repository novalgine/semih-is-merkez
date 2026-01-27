"use client";

import { motion } from "framer-motion";
import { Sparkles, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { InteractiveCard } from "@/components/ui/interactive-card";

// Mock Data (Replace with real AI summary logic later)
const SUMMARY_POINTS = [
    { id: 1, text: "Afife projesi teslim edildi", status: "done" },
    { id: 2, text: "Beklenen: Orhan, Melis", status: "waiting" },
    { id: 3, text: "Nakit uyarısı: 10k (1 ay runway)", status: "alert" },
];

export function AIBriefingSummary() {
    return (
        <InteractiveCard className="w-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border-indigo-500/20 p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-40 transition-opacity">
                <Sparkles className="h-12 w-12 text-indigo-400" />
            </div>

            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                        <Sparkles className="h-4 w-4 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white tracking-tight">Günün Özeti</h3>
                </div>

                <div className="space-y-3">
                    {SUMMARY_POINTS.map((point) => (
                        <div key={point.id} className="flex items-center gap-3 text-sm">
                            {point.status === "done" && <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />}
                            {point.status === "waiting" && <Clock className="h-4 w-4 text-amber-500 shrink-0" />}
                            {point.status === "alert" && <AlertTriangle className="h-4 w-4 text-red-500 shrink-0" />}

                            <span className="text-zinc-300 font-medium">{point.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </InteractiveCard>
    );
}
