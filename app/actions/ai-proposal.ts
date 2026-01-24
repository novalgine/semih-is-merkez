'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";

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

        // Temizlik (Markdown ```json ... ``` bloklarını kaldır)
        text = text.replace(/```json/g, '').replace(/```/g, '').trim();

        const items = JSON.parse(text);
        return { success: true, items };
    } catch (error: any) {
        console.error("AI Proposal Error:", error);
        return { success: false, error: error.message };
    }
}
