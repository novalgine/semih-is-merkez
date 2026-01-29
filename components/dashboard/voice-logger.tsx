"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { InteractiveCard } from "@/components/ui/interactive-card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type RecordingState = "idle" | "recording" | "processing" | "done";

export function VoiceLogger({ onLogCreated }: { onLogCreated: () => void }) {
    const [state, setState] = useState<RecordingState>("idle");
    const [duration, setDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    const MAX_DURATION = 120; // 2 minutes

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, []);

    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Detect supported audio format
            const mimeType = MediaRecorder.isTypeSupported('audio/webm')
                ? 'audio/webm'
                : 'audio/mp4';

            const mediaRecorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(chunksRef.current, { type: mimeType });
                await processAudio(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setState("recording");
            setDuration(0);

            // Timer + Auto-stop
            timerRef.current = setInterval(() => {
                setDuration(prev => {
                    if (prev >= MAX_DURATION) {
                        stopRecording();
                        return MAX_DURATION;
                    }
                    return prev + 1;
                });
            }, 1000);
        } catch (error) {
            toast.error("Mikrofon erişimi reddedildi");
            console.error(error);
        }
    }

    function stopRecording() {
        if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop();
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }

    async function processAudio(audioBlob: Blob) {
        setState("processing");

        try {
            const formData = new FormData();
            formData.append("audio", audioBlob);

            const response = await fetch("/api/voice/process", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("İşleme başarısız");

            const result = await response.json();

            setState("done");
            toast.success(`Kaydedildi: ${result.category}`);

            setTimeout(() => {
                setState("idle");
                onLogCreated();
            }, 2000);
        } catch (error) {
            setState("idle");
            toast.error("Ses işlenemedi");
            console.error(error);
        }
    }

    return (
        <InteractiveCard className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 p-6 rounded-2xl flex flex-col justify-between h-full">
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-lg font-semibold text-foreground">Sesli Not</h3>
                    <p className="text-sm text-muted-foreground">Düşüncelerini kaydet</p>
                </div>

                <AnimatePresence>
                    {state === "recording" && (
                        <motion.span
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-sm text-amber-600 dark:text-amber-400 font-mono tabular-nums bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20"
                        >
                            {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex flex-1 items-center justify-center py-8">
                {state === "idle" && (
                    <Button
                        onClick={startRecording}
                        className="h-20 w-20 rounded-full bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/50 p-0 flex items-center justify-center"
                    >
                        <Mic className="h-8 w-8 text-white" />
                    </Button>
                )}

                {state === "recording" && (
                    <motion.button
                        onClick={stopRecording}
                        className="h-20 w-20 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/50 flex items-center justify-center border-none cursor-pointer"
                        animate={{ scale: [1, 1.05, 1] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                    >
                        <Square className="h-6 w-6 text-white" />
                    </motion.button>
                )}

                {state === "processing" && (
                    <div className="flex flex-col items-center gap-3">
                        <Loader2 className="h-12 w-12 text-amber-500 animate-spin" />
                        <p className="text-sm text-muted-foreground font-medium">AI işliyor...</p>
                    </div>
                )}

                {state === "done" && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-20 w-20 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/50"
                    >
                        <Check className="h-10 w-10 text-white" />
                    </motion.div>
                )}
            </div>

            <div className="mt-4 min-h-[1.5rem] flex items-center justify-center">
                {state === "recording" && duration >= MAX_DURATION - 20 && (
                    <p className="text-xs text-amber-600 dark:text-amber-400 text-center animate-pulse font-bold">
                        Son {MAX_DURATION - duration} saniye! Kapasite dolmak üzere.
                    </p>
                )}
            </div>
        </InteractiveCard>
    );
}
