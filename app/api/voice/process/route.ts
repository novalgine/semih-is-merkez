import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        // Validate API key
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OpenAI API anahtarı eksik", details: "Lütfen .env.local dosyasını kontrol edin." },
                { status: 500 }
            );
        }

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const formData = await request.formData();
        const audioFile = formData.get("audio") as Blob;

        if (!audioFile) {
            return NextResponse.json(
                { error: "Ses dosyası alınamadı", details: "Tarayıcıdan sunucuya ses verisi iletilemedi." },
                { status: 400 }
            );
        }

        // 1. Transcribe with Whisper
        let transcription;
        try {
            const audioFileType = audioFile.type || "audio/webm";
            const extension = audioFileType.includes("mp4") ? "mp4" : "webm";

            transcription = await openai.audio.transcriptions.create({
                file: new File([audioFile], `audio.${extension}`, { type: audioFileType }),
                model: "whisper-1",
                language: "tr",
            });
        } catch (err: any) {
            console.error("Transcription Error:", err);
            return NextResponse.json(
                { error: "Ses yazıya dökülemedi (Whisper)", details: err.message },
                { status: 500 }
            );
        }

        const rawText = transcription.text;

        // 2. Categorize + Clean with GPT-4o-mini
        let result;
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `Sen bir Türkçe asistansın. Kullanıcının sesli notunu analiz edip şunları yap:

1. "umm", "eee", "şey" gibi dolgu kelimeleri çıkar.
2. Metni daha okunaklı hale getir (ama anlamı değiştirme).
3. Kategori belirle: To-Do, Idea, Thought, Meeting Note

Kategorizasyon Örnekleri:
- "Yarın Orhan'ı ara" → To-Do
- "Belki video kurgusu için yeni bir eklenti deneyelim" → Idea
- "Bugün çok yorgunum, dinlenmeliyim" → Thought
- "Müşteri toplantısında şunu konuştuk..." → Meeting Note

Duygu (Sentiment) Belirleme:
- Pozitif tonlama → Positive
- Aciliyet belirtiyorsa → Urgent
- Normal → Neutral

Cevabını JSON formatında ver:
{
  "content": "temizlenmiş metin (max 200 karakter)",
  "category": "kategori",
  "sentiment": "duygu"
}`
                    },
                    {
                        role: "user",
                        content: rawText
                    }
                ],
                response_format: { type: "json_object" }
            });
            result = JSON.parse(completion.choices[0].message.content || "{}");
        } catch (err: any) {
            console.error("AI Analysis Error:", err);
            return NextResponse.json(
                { error: "Yapay zeka analizi başarısız (GPT)", details: err.message },
                { status: 500 }
            );
        }

        // 3. Save to Supabase
        const supabase = await createClient();
        const { error: dbError } = await supabase
            .from('daily_logs')
            .insert({
                content: result.content,
                category: result.category,
                sentiment: result.sentiment,
            });

        if (dbError) {
            console.error("Supabase Insertion Error:", dbError);
            return NextResponse.json(
                { error: "Veritabanına kaydedilemedi", details: `Tablo 'daily_logs' bulunamadı veya RLS engeli var. SQL kodunu Supabase'de çalıştırdığınızdan emin olun. Hata: ${dbError.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error("Generic Voice processing error details:", error);
        return NextResponse.json(
            { error: "İşlem sırasında beklenmedik hata", details: error.message },
            { status: 500 }
        );
    }
}
