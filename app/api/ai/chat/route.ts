import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const { message, customerId } = await req.json();
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            console.error("Gemini API key is missing");
            return NextResponse.json(
                { error: "Gemini API key not configured" },
                { status: 500 }
            );
        }

        // 1. Fetch Customer Data, Interactions, and Projects
        const supabase = await createClient();

        const { data: customer, error: customerError } = await supabase
            .from("customers")
            .select("*")
            .eq("id", customerId)
            .single();

        if (customerError || !customer) {
            console.error("Customer fetch error:", customerError);
            return NextResponse.json(
                { error: "Customer not found" },
                { status: 404 }
            );
        }

        const { data: interactions } = await supabase
            .from("interactions")
            .select("*")
            .eq("customer_id", customerId)
            .order("date", { ascending: false })
            .limit(5); // Son 5 etkileşimi al

        const { data: projects } = await supabase
            .from("projects")
            .select("*")
            .eq("customer_id", customerId)
            .order("created_at", { ascending: false });

        // 2. Construct System Prompt
        const systemPrompt = `
      Sen ${customer.name} adlı müşterinin özel yapay zeka asistanısın.
      
      MÜŞTERİ BİLGİLERİ:
      - İsim: ${customer.name}
      - Şirket: ${customer.company || "Belirtilmemiş"}
      - Durum: ${customer.status}
      - E-posta: ${customer.email || "Belirtilmemiş"}
      - Telefon: ${customer.phone || "Belirtilmemiş"}
      - Kayıt Tarihi: ${new Date(customer.created_at).toLocaleDateString("tr-TR")}

      SON ETKİLEŞİMLER (Zaman Çizelgesi):
      ${interactions?.length ? interactions.map((i: any) => `- [${new Date(i.date).toLocaleDateString("tr-TR")} - ${i.type}]: ${i.content}`).join("\n") : "Henüz etkileşim yok."}

      PROJELER:
      ${projects?.length ? projects.map((p: any) => `- ${p.title} (Durum: ${p.status}, Bütçe: ${p.budget ? p.budget + ' TL' : 'Belirsiz'})`).join("\n") : "Henüz proje yok."}

      GÖREVİN:
      Kullanıcının (Semih) bu müşteriyle ilgili sorularını yanıtla.
      Samimi, profesyonel ve yardımsever bir dil kullan.
      Sadece bu müşterinin verilerine dayanarak konuş. Bilmediğin bir şey sorulursa uydurma, "Bu bilgiye sahip değilim" de.
    `;

        // 3. Call Gemini
        const genAI = new GoogleGenerativeAI(apiKey);
        // Using gemini-2.0-flash-exp as requested
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: systemPrompt + "\n\nAnlaşıldı mı?" }],
                },
                {
                    role: "model",
                    parts: [{ text: `Anlaşıldı. Ben ${customer.name} için asistanınım. Nasıl yardımcı olabilirim?` }],
                },
            ],
        });

        const result = await chat.sendMessage(message);
        const response = result.response;
        const text = response.text();

        return NextResponse.json({ response: text });
    } catch (error: any) {
        console.error("AI Chat Error Detailed:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
