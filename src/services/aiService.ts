import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

const getAI = () => new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export interface FunnelSuggestion {
  headlines: string[];
  cliffhangers: string[];
  cta: string;
  funnelSteps: {
    title: string;
    description: string;
    imagePrompt: string;
    overlayText: string;
  }[];
}

export interface StylePreferences {
  style?: string;
  color?: string;
  background?: string;
  textPosition?: 'top' | 'bottom' | 'center';
}

export async function generateFashionFunnel(
  goal: string,
  brandInfo: string,
  imageDescriptions: string[],
  stylePrefs: StylePreferences,
  styleReferenceDescription?: string
): Promise<FunnelSuggestion> {
  const ai = getAI();
  const model = "gemini-3.1-pro-preview";

  const prompt = `
    Ты — эксперт по маркетингу для брендов одежды и контент-стратег. 
    Твоя задача: создать контентную воронку (серию из 4-5 постов/фото) для бренда одежды.
    
    Цель: ${goal}
    Информация о бренде: ${brandInfo}
    Описание загруженных фото товаров: ${imageDescriptions.length > 0 ? imageDescriptions.join(", ") : "Нет описаний"}
    
    Предпочтения по стилю оформления:
    - Стиль: ${stylePrefs.style || "Не указан"}
    - Цвет: ${stylePrefs.color || "Не указан"}
    - Подложка/фон: ${stylePrefs.background || "Не указан"}
    - Расположение текста: ${stylePrefs.textPosition || "Не указано"}
    ${styleReferenceDescription ? `- Референс стиля (описание): ${styleReferenceDescription}` : ""}

    Тебе нужно предложить:
    1. 4 триггерных заголовка (на русском).
    2. 2-3 клиффхэнгера (фразы, заставляющие читать дальше).
    3. Вопрос для CTA (призыв к действию) в конце.
    4. Описание серии из 4-5 шагов воронки. Для каждого шага:
       - Название шага.
       - Описание того, что должно быть на фото (используй загруженные фото как основу, если они есть).
       - Текст, который должен быть наложен на фото (инфографика), учитывая выбранный стиль и расположение.
       - Промпт для генерации изображения (на английском), если пользователь захочет создать новое фото.

    Верни ответ строго в формате JSON.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: [{ parts: [{ text: prompt }] }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          headlines: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "4 trigger headlines in Russian"
          },
          cliffhangers: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Cliffhangers in Russian"
          },
          cta: {
            type: Type.STRING,
            description: "CTA question in Russian"
          },
          funnelSteps: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                imagePrompt: { type: Type.STRING },
                overlayText: { type: Type.STRING }
              },
              required: ["title", "description", "imagePrompt", "overlayText"]
            }
          }
        },
        required: ["headlines", "cliffhangers", "cta", "funnelSteps"]
      }
    }
  });

  return JSON.parse(response.text || "{}") as FunnelSuggestion;
}

export async function generateFashionImage(prompt: string): Promise<string | null> {
  const ai = getAI();
  const model = "gemini-3.1-flash-image-preview";

  try {
    const response = await ai.models.generateContent({
      model,
      contents: {
        parts: [{ text: `High-end fashion photography, editorial style, professional lighting: ${prompt}` }]
      },
      config: {
        imageConfig: {
          aspectRatio: "3:4",
          imageSize: "1K"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Image generation failed:", error);
  }
  return null;
}
