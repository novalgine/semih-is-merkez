'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";

const proposalItemSchema = z.object({
    description: z.string().min(1),
    quantity: z.number().int().positive(),
    unitPrice: z.number().nonnegative(),
});

const proposalItemsSchema = z.array(proposalItemSchema).min(1).max(10);

export function parseProposalItemsResponse(rawText: string) {
    const cleanedText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanedText);
    return proposalItemsSchema.parse(parsed);
}

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

        const prompt = `
        Sen profesyonel bir video prodüksiyon şirketisin. 
        "${projectTitle}" başlıklı bir proje için 3-5 kalemlik mantıklı bir hizmet listesi ve tahmini fiyatlar oluştur.
        
        ${toneInstruction}

        Çıktıyı SADECE şu JSON formatında ver, başka hiçbir şey yazma:
        [
            { "description": "Hizmet Adı", "quantity": 1, "unitPrice": 5000 },
            ...
        ]
        Fiyatlar TL cinsinden ve piyasa standartlarında olsun.
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        let text = response.text();

        const items = parseProposalItemsResponse(text);
        return { success: true, items };
    } catch (error: any) {
        console.error("AI Proposal Error:", error);
        return { success: false, error: error.message };
    }
}
