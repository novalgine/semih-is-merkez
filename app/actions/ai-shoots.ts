'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function generateShotList(projectTitle: string, projectDescription?: string) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const prompt = `
        Sen profesyonel bir Video Prodüktörü ve Yönetmenisin.
        Aşağıdaki proje için 5-8 maddelik, uygulanabilir ve yaratıcı bir "Shot List" (Çekim Listesi) hazırla.

        PROJE: ${projectTitle}
        ${projectDescription ? `DETAY: ${projectDescription}` : ''}

        Çıktıyı SADECE şu JSON formatında ver, başka hiçbir şey yazma:
        [
            { 
                "scene_number": 1, 
                "description": "Ofis genel plan, çalışanlar masada", 
                "angle": "Geniş Açı", 
                "duration": "10 dk" 
            },
            ...
        ]
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // JSON temizleme (Markdown bloklarını kaldır)
        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("AI Shot List Error:", error);
        return [];
    }
}

export async function generateEquipmentList(scenes: any[]) {
    try {
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const scenesText = scenes.map(s => `- ${s.description} (${s.angle})`).join('\n');

        const prompt = `
        Sen profesyonel bir Görüntü Yönetmenisin (DOP).
        Aşağıdaki sahne listesini incele ve bu çekimi gerçekleştirmek için gereken EKİPMANLARI listele.
        
        SAHNELER:
        ${scenesText}

        Kurallar:
        1. Gereksiz ekipman yazma, sadece bu sahneler için kritik olanları seç.
        2. Eğer "Drone", "Gimbal", "Slider", "Makro Lens" gibi özel ihtiyaçlar varsa mutlaka belirt.
        3. Temel set (Kamera, Tripod, Işık, Ses) zaten var varsay, ama yine de listeye ekle.

        Çıktıyı SADECE şu JSON formatında ver (String array), başka hiçbir şey yazma:
        [
            "Sony A7SIII Kamera",
            "DJI Ronin Gimbal (Takip sahneleri için)",
            "Drone (Dış mekan için)",
            "Yaka Mikrofonu",
            ...
        ]
        `;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(jsonStr);

    } catch (error) {
        console.error("AI Equipment Error:", error);
        return [
            "Kamera (Ana)",
            "Tripod",
            "Işık Seti",
            "Ses Ekipmanı"
        ];
    }
}
