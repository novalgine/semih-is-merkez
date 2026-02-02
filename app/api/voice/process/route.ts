import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { addCustomer } from "@/app/actions/customers";
import { addInteraction } from "@/app/actions/interactions";
import { createTask } from "@/app/actions/tasks";
import { createService } from "@/app/actions/services";
import { addExpense } from "@/app/actions/finance";

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
        const currentTime = new Date().toISOString();

        // 2. Intelligent Intent Routing with GPT-4o-mini
        let analysis;
        try {
            const completion = await openai.chat.completions.create({
                model: "gpt-4o-mini",
                messages: [
                    {
                        role: "system",
                        content: `Sen bir akıllı iş asistanısın. Kullanıcının sesli komutunu analiz edip doğru aksiyonu belirle.
                        
                        Şu anki zaman: ${currentTime}
                        
                        Kullanabileceğin aksiyonlar (intents):
                        1. ADD_CUSTOMER: Yeni bir müşteri kaydı. Parametreler: { "name": string, "company": string | null }
                        2. ADD_INTERACTION: Mevcut bir müşteriyle görüşme notu. Parametreler: { "customerName": string, "content": string, "type": "meeting" | "note" | "call" }
                        3. ADD_TASK: Bir görev veya yapılacak iş. Parametreler: { "content": string, "date": "YYYY-MM-DD" | null, "category": string }
                        4. ADD_SERVICE: Yeni bir hizmet/ürün tanımı. Parametreler: { "name": string, "description": string, "price": number }
                        5. ADD_EXPENSE: Finansal bir gider kaydı. Parametreler: { "description": string, "amount": number, "category": string, "date": "YYYY-MM-DD" }
                        6. GENERAL_LOG: Yukarıdakilere uymayan genel notlar. Parametreler: { "content": string, "category": string }

                        Önemli Kurallar:
                        - Kullanıcı "Mehmet ile görüştüm" diyorsa ADD_INTERACTION seç.
                        - "Yarın şunu yapacağım" diyorsa ADD_TASK seç ve date'i yarının tarihine setle (Zamanı baz al).
                        - "Bugün marketten 100 lira harcadım" diyorsa ADD_EXPENSE seç.
                        - Eğer komut çok belirsizse GENERAL_LOG seç.
                        - Cevabını SADECE JSON formatında ver.
                        
                        Yanıt Formatı:
                        {
                          "intent": "INTENT_NAME",
                          "params": { ...ilgili parametreler... },
                          "feedback": "Kullanıcıya söylenecek kısa onay mesajı (Örn: 'Mehmet Yılmaz CRM'e eklendi')"
                        }`
                    },
                    {
                        role: "user",
                        content: rawText
                    }
                ],
                response_format: { type: "json_object" }
            });
            analysis = JSON.parse(completion.choices[0].message.content || "{}");
        } catch (err: any) {
            console.error("AI Analysis Error:", err);
            return NextResponse.json(
                { error: "Yapay zeka analizi başarısız", details: err.message },
                { status: 500 }
            );
        }

        const { intent, params, feedback } = analysis;

        // 3. Dispatch to Server Actions
        const supabase = await createClient();
        let executionResult = { success: false, error: "" };

        try {
            switch (intent) {
                case "ADD_CUSTOMER":
                    executionResult = await addCustomer({
                        name: params.name,
                        company: params.company || "",
                        status: 'lead'
                    }) as any;
                    break;

                case "ADD_INTERACTION":
                    // First find customer by name
                    const { data: customer } = await supabase
                        .from('customers')
                        .select('id')
                        .ilike('name', `%${params.customerName}%`)
                        .limit(1)
                        .single();

                    if (customer) {
                        executionResult = await addInteraction({
                            customerId: customer.id,
                            content: params.content,
                            type: params.type || 'note',
                            date: new Date().toISOString()
                        }) as any;
                    } else {
                        throw new Error(`Müşteri bulunamadı: ${params.customerName}`);
                    }
                    break;

                case "ADD_TASK":
                    executionResult = await createTask(
                        params.content,
                        params.date,
                        params.category || 'Sesli Not',
                        params.priority || 'medium',
                        params.description
                    ) as any;
                    break;

                case "ADD_SERVICE":
                    executionResult = await createService({
                        name: params.name,
                        description: params.description || "",
                        price: params.price || 0
                    }) as any;
                    break;

                case "ADD_EXPENSE":
                    executionResult = await addExpense({
                        description: params.description,
                        amount: params.amount,
                        category: params.category || 'Genel',
                        date: params.date || new Date().toISOString().split('T')[0]
                    }) as any;
                    break;

                case "GENERAL_LOG":
                default:
                    // Redirect to tasks instead of missing daily_logs table
                    executionResult = await createTask(
                        params.content || rawText,
                        null, // no specific date
                        params.category || 'Sesli Not',
                        'medium',
                        undefined
                    ) as any;
                    break;
            }
        } catch (err: any) {
            console.error("Execution Error:", err);
            return NextResponse.json(
                { error: "İşlem gerçekleştirilemedi", details: err.message },
                { status: 500 }
            );
        }

        if (!executionResult.success) {
            return NextResponse.json(
                { error: "Hata oluştu", details: executionResult.error },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            feedback,
            intent,
            originalText: rawText
        });

    } catch (error: any) {
        console.error("Voice process generic error:", error);
        return NextResponse.json(
            { error: "Sistem hatası", details: error.message },
            { status: 500 }
        );
    }
}
