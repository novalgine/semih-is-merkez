import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
    try {
        // Validate API key
        if (!process.env.OPENAI_API_KEY) {
            return NextResponse.json(
                { error: "OpenAI API key missing" },
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
                { error: "No audio file" },
                { status: 400 }
            );
        }

        // 1. Transcribe with Whisper
        const transcription = await openai.audio.transcriptions.create({
            file: new File([audioFile], "audio.webm", { type: "audio/webm" }),
            model: "whisper-1",
            language: "tr",
        });

        const rawText = transcription.text;

        // 2. Categorize + Clean with GPT-4o-mini
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

        const result = JSON.parse(completion.choices[0].message.content || "{}");

        // 3. Save to Supabase
        const supabase = await createClient();
        const { error } = await supabase
            .from('daily_logs')
            .insert({
                content: result.content,
                category: result.category,
                sentiment: result.sentiment,
            });

        if (error) throw error;

        return NextResponse.json(result);
    } catch (error) {
        console.error("Voice processing error:", error);
        return NextResponse.json(
            { error: "Processing failed" },
            { status: 500 }
        );
    }
}
