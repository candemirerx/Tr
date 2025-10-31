
import { GoogleGenAI, Type } from "@google/genai";
import type { GrammarFeedback } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this environment, we assume it's always available.
  console.warn("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const grammarCheckSchema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.INTEGER,
      description: "Yazının dil bilgisi ve imla kurallarına uygunluğuna göre 0 ile 100 arasında bir puan. 100 mükemmel demektir."
    },
    errors: {
      type: Type.ARRAY,
      description: "Metinde bulunan hataların bir listesi.",
      items: {
        type: Type.OBJECT,
        properties: {
          incorrectWord: {
            type: Type.STRING,
            description: "Hatalı olan kelime veya ifade."
          },
          correction: {
            type: Type.STRING,
            description: "Önerilen doğru yazım."
          },
          explanation: {
            type: Type.STRING,
            description: "Türkçe dil bilgisi kurallarına göre hatanın kısa bir açıklaması."
          }
        },
        required: ["incorrectWord", "correction", "explanation"]
      }
    },
    summary: {
      type: Type.STRING,
      description: "Kullanıcının performansı hakkında kısa, teşvik edici bir özet."
    }
  },
  required: ["score", "errors", "summary"]
};


export const checkTurkishGrammar = async (text: string): Promise<GrammarFeedback> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Lütfen aşağıdaki metni Türkçe imla ve dil bilgisi kurallarına göre analiz et ve JSON formatında bir değerlendirme sun. Metin: "${text}"`,
      config: {
        systemInstruction: "Sen Türk Dil Kurumu (TDK) kurallarına hakim, uzman bir Türkçe dil bilimcisin. Görevin, verilen metni analiz edip yazım ve dil bilgisi hatalarını bulmak, puanlamak ve geri bildirim sağlamaktır. Cevabını sadece istenen JSON formatında ver.",
        responseMimeType: "application/json",
        responseSchema: grammarCheckSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedResponse = JSON.parse(jsonText);

    return parsedResponse as GrammarFeedback;

  } catch (error) {
    console.error("Error checking grammar with Gemini API:", error);
    throw new Error("Failed to get grammar feedback from Gemini API.");
  }
};
