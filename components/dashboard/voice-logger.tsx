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
    const streamRef = useRef<MediaStream | null>(null);
    const isCancelledRef = useRef(false);

    const MAX_DURATION = 120; // 2 minutes

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    async function startRecording() {
        try {
            isCancelledRef.current = false;
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

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
                const wasCancelled = isCancelledRef.current;

                if (streamRef.current) {
                    streamRef.current.getTracks().forEach(track => track.stop());
                    streamRef.current = null;
                }

                if (!wasCancelled) {
                    const audioBlob = new Blob(chunksRef.current, { type: mimeType });
                    await processAudio(audioBlob);
                } else {
                    setState("idle");
                }
            };

            mediaRecorder.start();
            setState("recording");
            setDuration(0);

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
            setState("idle");
        }
    }

    function stopRecording() {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop();
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    }

    function cancelRecording() {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            isCancelledRef.current = true;
            mediaRecorderRef.current.stop();
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            chunksRef.current = [];
            setState("idle");
            toast.info("Kayıt iptal edildi");
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

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.details || "İşleme başarısız");
            }

            setState("done");
            toast.success(`Kaydedildi: ${result.category}`);

            setTimeout(() => {
                setState("idle");
                onLogCreated();
            }, 2000);
        } catch (error: any) {
            setState("idle");
            toast.error(`Ses işlenemedi: ${error.message}`);
            console.error("Processing error:", error);
        }
    }

    return (
        <InteractiveCard className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20 p-4 rounded-2xl flex flex-col justify-between h-full min-h-[160px]">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <div className={`h-2 w-2 rounded-full ${state === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-amber-500'}`} />
                    <h3 className="text-sm font-semibold text-foreground">Sesli Not</h3>
                </div>

                <AnimatePresence>
                    {state === "recording" && (
                        <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="text-[10px] text-amber-600 dark:text-amber-400 font-mono font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20"
                        >
                            {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                        </motion.span>
                    )}
                </AnimatePresence>
            </div>

            <div className="flex flex-1 items-center justify-center">
                {state === "idle" && (
                    <Button
                        onClick={startRecording}
                        className="h-12 w-12 rounded-full bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/30 p-0 flex items-center justify-center transition-transform hover:scale-105"
                    >
                        <Mic className="h-5 w-5 text-white" />
                    </Button>
                )}

                {state === "recording" && (
                    <div className="flex flex-col items-center gap-4">
                        <motion.button
                            onClick={stopRecording}
                            className="h-12 w-12 rounded-full bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/30 flex items-center justify-center border-none cursor-pointer"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                        >
                            <Square className="h-4 w-4 text-white" />
                        </motion.button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={cancelRecording}
                            className="text-[10px] text-muted-foreground hover:text-red-500 h-6 px-2"
                        >
                            İptal Et
                        </Button>
                    </div>
                )}

                {state === "processing" && (
                    <div className="flex flex-col items-center gap-2">
                        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                        <p className="text-[10px] text-muted-foreground font-medium">Analiz ediliyor...</p>
                    </div>
                )}

                {state === "done" && (
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg shadow-emerald-500/30"
                    >
                        <Check className="h-6 w-6 text-white" />
                    </motion.div>
                )}
            </div>

            <div className="mt-2 min-h-[1rem] flex items-center justify-center">
                {state === "recording" && duration >= MAX_DURATION - 20 && (
                    <p className="text-[9px] text-amber-600 dark:text-amber-400 text-center animate-pulse font-bold">
                        Son saniyeler!
                    </p>
                )}
                {state === "idle" && (
                    <p className="text-[10px] text-muted-foreground text-center italic">
                        Dokun ve konuş
                    </p>
                )}
            </div>
        </InteractiveCard>
    );
}
