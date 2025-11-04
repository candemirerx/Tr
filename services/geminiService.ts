

import { GoogleGenAI, Type } from "@google/genai";
import type { GrammarFeedback, GroundingDocument } from '../types';

// FIX: Per coding guidelines, initialize the client by using process.env.API_KEY directly.
// The key is assumed to be available in the environment.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

const grammarCheckSchema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.INTEGER,
      description: "Yazının dil bilgisi, imla ve noktalama kurallarına uygunluğuna göre 0 ile 100 arasında bir puan. 100 mükemmel demektir."
    },
    errors: {
      type: Type.ARRAY,
      description: "Metinde bulunan yazım ve noktalama hatalarının bir listesi.",
      items: {
        type: Type.OBJECT,
        properties: {
          errorType: {
            type: Type.STRING,
            description: "Hatanın türü: 'yazım' (spelling) veya 'noktalama' (punctuation).",
            enum: ["yazım", "noktalama"]
          },
          text: {
            type: Type.STRING,
            description: "Hatalı olan kelime veya ifade."
          },
          startIndex: {
            type: Type.INTEGER,
            description: "Hatalı ifadenin orijinal metindeki 0-tabanlı başlangıç karakter indeksi."
          },
          endIndex: {
            type: Type.INTEGER,
            description: "Hatalı ifadenin orijinal metindeki 0-tabanlı bitiş karakter indeksi (bu indeks dahil DEĞİL). Bu, substring(startIndex, endIndex) işleminin tam olarak hatalı metni döndürmesini sağlar."
          },
          correction: {
            type: Type.STRING,
            description: "Önerilen doğru yazım veya noktalama."
          },
          explanation: {
            type: Type.STRING,
            description: "Türkçe dil bilgisi kurallarına göre hatanın kısa bir açıklaması."
          }
        },
        required: ["errorType", "text", "startIndex", "endIndex", "correction", "explanation"]
      }
    },
    summary: {
      type: Type.STRING,
      description: "Kullanıcının performansı hakkında kısa, teşvik edici ve doktor tavsiyesi gibi bir özet."
    },
    correctedText: {
        type: Type.STRING,
        description: "Kullanıcının metninin tüm hataları düzeltilmiş tam hali."
    }
  },
  required: ["score", "errors", "summary", "correctedText"]
};


export const checkTurkishGrammar = async (text: string, userContext: string | undefined, groundingDocuments: GroundingDocument[] | undefined, aiModelPreference: 'flash' | 'pro' = 'flash'): Promise<GrammarFeedback> => {
  try {
    let systemInstruction = "Sen 'Yazım Doktoru' adında, Türk Dil Kurumu (TDK) kurallarına hakim, uzman bir Türkçe dil bilimcisin. Görevin, verilen metni analiz edip yazım, imla ve noktalama hatalarını bulmak, her hatanın başlangıç ve bitiş indekslerini belirlemek, puanlamak, geri bildirim sağlamak ve metnin tamamen düzeltilmiş bir versiyonunu oluşturmaktır.";

    if (userContext && userContext.trim().length > 0) {
      systemInstruction += ` Analizini yaparken şu kullanıcı bağlamını ve özel kuralları dikkate al: '${userContext}'. Bu kurallara uyan durumları hata olarak işaretleme.`;
    }

    if (groundingDocuments && groundingDocuments.length > 0) {
        const documentsContent = groundingDocuments.map(doc => `--- Döküman: ${doc.name} ---\n${doc.content}`).join('\n\n');
        systemInstruction += `\n\nAyrıca, analizini yaparken aşağıdaki dökümanları BİRİNCİL ve TEK doğruluk kaynağı olarak kullan. Bu dökümanlardaki kurallar, TDK kuralları da dahil olmak üzere diğer tüm genel bilgilerinden daha önceliklidir. İşte dökümanların içeriği:\n\n${documentsContent}`;
    }
    
    systemInstruction += "\n\nCevabını sadece istenen JSON formatında ver.";

    const modelName = aiModelPreference === 'pro' ? 'gemini-2.5-pro' : 'gemini-flash-latest';
    const thinkingConfig = aiModelPreference === 'pro' ? {} : { thinkingBudget: 0 };

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Lütfen aşağıdaki metni Türkçe imla, yazım ve noktalama kurallarına göre analiz et ve JSON formatında bir değerlendirme sun. Metin: "${text}"`,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: grammarCheckSchema,
        thinkingConfig: thinkingConfig,
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

export const translateToEnglish = async (text: string, aiModelPreference: 'flash' | 'pro' = 'flash'): Promise<string> => {
  if (!text.trim()) {
    return "";
  }
  try {
    const modelName = aiModelPreference === 'pro' ? 'gemini-2.5-pro' : 'gemini-flash-latest';
    const thinkingConfig = aiModelPreference === 'pro' ? {} : { thinkingBudget: 0 };

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Lütfen aşağıdaki Türkçe metni İngilizce'ye çevir. Metin: "${text}"`,
      config: {
        systemInstruction: "You are an expert Turkish-to-English translator. Your sole task is to provide a high-fidelity translation of the given text, preserving its original meaning, tone, and any nuances. Provide ONLY the translated English text as your response.",
        temperature: 0.2,
        thinkingConfig: thinkingConfig,
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error translating text with Gemini API:", error);
    throw new Error("Metin çevrilirken bir hata oluştu.");
  }
};

export const translateToTurkish = async (text: string, aiModelPreference: 'flash' | 'pro' = 'flash'): Promise<string> => {
  if (!text.trim()) {
    return "";
  }
  try {
    const modelName = aiModelPreference === 'pro' ? 'gemini-2.5-pro' : 'gemini-flash-latest';
    const thinkingConfig = aiModelPreference === 'pro' ? {} : { thinkingBudget: 0 };

    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Lütfen aşağıdaki İngilizce metni Türkçe'ye çevir. Metin: "${text}"`,
      config: {
        systemInstruction: "You are an expert English-to-Turkish translator. Your sole task is to provide a high-fidelity translation of the given text, preserving its original meaning, tone, and any nuances. Provide ONLY the translated Turkish text as your response.",
        temperature: 0.2,
        thinkingConfig: thinkingConfig,
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error translating text with Gemini API:", error);
    throw new Error("Metin çevrilirken bir hata oluştu.");
  }
};

export const detectLanguage = async (text: string, aiModelPreference: 'flash' | 'pro' = 'flash'): Promise<'tr' | 'en' | 'unknown'> => {
  if (!text.trim()) {
    return "unknown";
  }
  try {
    const modelName = aiModelPreference === 'pro' ? 'gemini-2.5-pro' : 'gemini-flash-latest';
    const thinkingConfig = aiModelPreference === 'pro' ? {} : { thinkingBudget: 0 };
    
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Lütfen aşağıdaki metnin dilini belirle. Sadece 'tr' (Türkçe için) veya 'en' (İngilizce için) olarak yanıt ver. Başka hiçbir açıklama ekleme. Metin: "${text}"`,
      config: {
        temperature: 0,
        thinkingConfig: thinkingConfig,
      },
    });
    const result = response.text.trim().toLowerCase();
    if (result === 'tr' || result === 'en') {
      return result;
    }
    return 'unknown';
  } catch (error) {
    console.error("Error detecting language with Gemini API:", error);
    throw new Error("Dil algılanırken bir hata oluştu.");
  }
};


export const enhancePrompt = async (
  text: string, 
  enhancementLevel: number, 
  forceRoleContext: boolean,
  aiModelPreference: 'flash' | 'pro' = 'flash'
): Promise<string> => {
  if (!text.trim()) {
    return "";
  }

  let systemInstruction = "Sen uzman bir 'Prompt Mühendisi'sin. Görevin, kullanıcı tarafından sağlanan taslak bir prompt'u analiz etmek ve kullanıcının asıl niyetini (muradını) anlamaktır. Bu niyeti temel alarak, prompt'u başka bir yapay zeka modeli için daha etkili hale getir. Kullanıcının prompt'unu yanıtlama, sadece prompt'un kendisini geliştir. Cevap olarak SADECE geliştirilmiş ve tamamlanmış prompt metnini Türkçe olarak ver.";
  
  if (forceRoleContext) {
    systemInstruction += "\n\nKullanıcının isteği ne olursa olsun, prompt'a MUTLAKA net bir ROL, detaylı bir BAĞLAM ve belirli bir GÖREV ekleyerek onu zenginleştir.";
  }

  if (enhancementLevel === 0) { // Auto mode
    if (!forceRoleContext) {
      systemInstruction += "\n\nPrompt'un karmaşıklığını analiz et. Eğer karmaşık ve fayda sağlayacaksa, net bir ROL, BAĞLAM ve GÖREV ekleyerek zenginleştir. Eğer basitse, sadece daha anlaşılır kılacak küçük iyileştirmeler yap, gereksiz yere rol ve bağlam ekleme. Amacın her zaman prompt'un kalitesini duruma uygun şekilde artırmaktır.";
    }
    // If forceRoleContext is true, the base instruction is enough for auto mode.
  } else if (enhancementLevel > 0) { // Positive enhancement
    systemInstruction += `\n\nPrompt'u, geliştirme yoğunluğu ve detay seviyesi pozitif yönde (+1 ile +30 arasında), yaklaşık olarak +${enhancementLevel} seviyesinde olacak şekilde daha kapsamlı ve detaylı hale getir. +30, mümkün olan en kapsamlı ve detaylı versiyonu ifade eder.`;
    if (!forceRoleContext) {
      systemInstruction += " Kullanıcı rol ve bağlam eklenmesini zorunlu kılmadığı için, bu yapıyı sadece gerçekten gerekli olduğunda kullan.";
    }
  } else { // Negative enhancement (simplification), enhancementLevel < 0
    systemInstruction += `\n\nPrompt'u, basitleştirme yoğunluğu negatif yönde (-1 ile -20 arasında), yaklaşık olarak ${enhancementLevel} seviyesinde olacak şekilde daha kısa, açık ve net bir hale getir. -20, mümkün olan en kısa ve özet versiyonu ifade eder. Karmaşık ve gereksiz detayları çıkar.`;
    if (forceRoleContext) {
      systemInstruction += " Bu basitleştirme işlemine rağmen, prompt'un ROL ve BAĞLAM yapısını koru, ancak bu bölümleri de olabildiğince kısa ve öz tut.";
    }
  }
  
  const modelName = aiModelPreference === 'pro' ? 'gemini-2.5-pro' : 'gemini-flash-latest';
  const temperature = aiModelPreference === 'pro' ? 0.6 : 0.5;
  const thinkingConfig = aiModelPreference === 'pro' ? {} : { thinkingBudget: 0 };

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: `Aşağıdaki taslak prompt'u analiz et ve geliştir: "${text}"`,
      config: {
        systemInstruction: systemInstruction,
        temperature: temperature,
        thinkingConfig: thinkingConfig,
      },
    });
    return response.text.trim();
  } catch (error) {
    console.error("Error enhancing prompt with Gemini API:", error);
    throw new Error("Prompt geliştirilirken bir hata oluştu.");
  }
};