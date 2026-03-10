import { GoogleGenAI, Type } from '@google/genai';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const { goal, brandInfo, imageDescriptions, stylePrefs, styleReferenceDescription } = req.body;

    const ai = new GoogleGenAI({ apiKey });

    const prompt = `
    Ты — эксперт по маркетингу для брендов одежды и контент-стратег. 
    Твоя задача: создать контентную воронку (серию из 4-5 постов/фото) для бренда одежды.
    
    Цель: ${goal}
    Информация о бренде: ${brandInfo}
    Описание загруженных фото товаров: ${imageDescriptions?.length > 0 ? imageDescriptions.join(', ') : 'Нет описаний'}
    
    Предпочтения по стилю оформления:
    - Стиль: ${stylePrefs?.style || 'Не указан'}
    - Цвет: ${stylePrefs?.color || 'Не указан'}
    - Подложка/фон: ${stylePrefs?.background || 'Не указан'}
    - Расположение текста: ${stylePrefs?.textPosition || 'Не указано'}
    ${styleReferenceDescription ? `- Референс стиля: ${styleReferenceDescription}` : ''}

    Тебе нужно предложить:
    1. 4 триггерных заголовка (на русском).
    2. 2-3 клиффхэнгера (фразы, заставляющие читать дальше).
    3. Вопрос для CTA (призыв к действию) в конце.
    4. Описание серии из 4-5 шагов воронки. Для каждого шага:
       - Название шага.
       - Описание того, что должно быть на фото.
       - Текст, который должен быть наложен на фото (инфографика).
       - Промпт для генерации изображения (на английском).

    Верни ответ строго в формате JSON без каких-либо пояснений.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            headlines: { type: Type.ARRAY, items: { type: Type.STRING } },
            cliffhangers: { type: Type.ARRAY, items: { type: Type.STRING } },
            cta: { type: Type.STRING },
            funnelSteps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  imagePrompt: { type: Type.STRING },
                  overlayText: { type: Type.STRING },
                },
                required: ['title', 'description', 'imagePrompt', 'overlayText'],
              },
            },
          },
          required: ['headlines', 'cliffhangers', 'cta', 'funnelSteps'],
        },
      },
    });

    const result = JSON.parse(response.text || '{}');
    return res.status(200).json(result);

  } catch (error) {
    console.error('Generation error:', error);
    return res.status(500).json({ error: 'Generation failed: ' + error.message });
  }
}
