'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const proposalItemSchema = z.object({
    description: z.string().min(1, "Açıklama boş olamaz."),
    quantity: z.number().positive("Miktar 0'dan büyük olmalıdır."),
    unitPrice: z.number().nonnegative("Birim fiyat negatif olamaz."),
});

const proposalItemsSchema = z.array(proposalItemSchema).min(1, "En az bir kalem üretilmelidir.");

const stripMarkdownCodeFences = (text: string) =>
    text.replace(/```json/gi, '').replace(/```/g, '').trim();

export async function generateProposalItems(projectTitle: string, tone: 'corporate' | 'creative' | 'friendly' = 'corporate') {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return { success: false, error: "API Key missing" };

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        let toneInstruction = "";
        switch (tone) {
            case 'corporate':
                toneInstruction = "Dilin resmi, profesyonel ve kurumsal olsun. Hizmet adları standart sektör terimleri olsun.";
                break;
            case 'creative':
                toneInstruction = "Dilin yaratıcı, heyecan verici ve vizyoner olsun. Hizmet adları etkileyici olsun.";
                break;
            case 'friendly':
                toneInstruction = "Dilin samimi, sıcak ve anlaşılır olsun. Hizmet adları basit ve net olsun.";
                break;
        }

        const basePrompt = `
        Sen profesyonel bir video prodüksiyon şirketisin.
        "${projectTitle}" başlıklı bir proje için 3-5 kalemlik mantıklı bir hizmet listesi ve tahmini fiyatlar oluştur.

        ${toneInstruction}

        Çıktıyı SADECE şu JSON formatında ver, başka hiçbir şey yazma:
        [
            { "description": "Hizmet Adı", "quantity": 1, "unitPrice": 5000 }
        ]
        Kurallar:
        - JSON dizisi dışında hiçbir metin verme.
        - description string olmalı.
        - quantity sayı olmalı ve 0'dan büyük olmalı.
        - unitPrice sayı olmalı ve negatif olmamalı.
        - Fiyatlar TL cinsinden ve piyasa standartlarında olsun.
        `;

        const prompts = [
            basePrompt,
            `${basePrompt}\n\nÖnceki cevap formatı bozuktu. Sadece ve sadece parse edilebilir geçerli JSON dizisi döndür.`,
        ];

        let lastError: string | null = null;

        for (const prompt of prompts) {
            const result = await model.generateContent(prompt);
            const response = result.response;
            let text = response.text();

            // Temizlik (Markdown ```json ... ``` bloklarını kaldır)
            text = stripMarkdownCodeFences(text);

            try {
                const parsed = JSON.parse(text);
                const validatedItems = proposalItemsSchema.parse(parsed);
                return { success: true, items: validatedItems };
            } catch (parseOrValidationError: unknown) {
                lastError = parseOrValidationError instanceof Error
                    ? parseOrValidationError.message
                    : "Model cevabı geçersiz formatta.";
            }
        }

        return {
            success: false,
            error: `Teklif kalemleri oluşturulamadı. Lütfen tekrar deneyin. (Detay: ${lastError})`,
        };
    } catch (error: unknown) {
        console.error("AI Proposal Error:", error);
        return { success: false, error: "Yapay zekadan geçerli teklif alınamadı. Lütfen kısa süre sonra tekrar deneyin." };
    }
}
