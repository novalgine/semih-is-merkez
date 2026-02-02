"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square, Loader2, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type RecordingState = "idle" | "recording" | "processing" | "done";

interface VoiceNoteInlineProps {
    onComplete: () => void;
}

export function VoiceNoteInline({ onComplete }: VoiceNoteInlineProps) {
    const [state, setState] = useState<RecordingState>("idle");
    const [duration, setDuration] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const isCancelledRef = useRef(false);

    const MAX_DURATION = 120;

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
        if (audioBlob.size < 500) {
            setState("idle");
            toast.error("Ses tespit edilemedi.");
            return;
        }

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
                throw new Error(result.error || "İşleme başarısız");
            }

            setState("done");
            toast.success(result.feedback || "İşlem başarıyla tamamlandı");

            setTimeout(() => {
                setState("idle");
                onComplete();
            }, 1500);
        } catch (error: any) {
            setState("idle");
            toast.error(error.message || "Bir hata oluştu");
        }
    }

    useEffect(() => {
        // Auto-start recording on mount
        startRecording();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/20 flex items-center gap-4">
            {state === "recording" && (
                <>
                    <div className="flex-1 flex items-center gap-3">
                        <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-sm font-medium">Kaydediliyor...</span>
                        <span className="text-xs font-mono text-muted-foreground">
                            {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
                        </span>
                    </div>
                    <Button size="sm" onClick={stopRecording} variant="default">
                        <Square className="h-3 w-3 mr-1" /> Durdur
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelRecording}>
                        <X className="h-3 w-3" />
                    </Button>
                </>
            )}

            {state === "processing" && (
                <div className="flex-1 flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                    <span className="text-sm">Analiz ediliyor...</span>
                </div>
            )}

            {state === "done" && (
                <div className="flex-1 flex items-center justify-center gap-2">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-sm font-medium">Tamamlandı!</span>
                </div>
            )}
        </div>
    );
}
