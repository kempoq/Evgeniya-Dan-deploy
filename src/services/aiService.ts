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
  const response = await fetch('/api/generate-funnel', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      goal,
      brandInfo,
      imageDescriptions,
      stylePrefs,
      styleReferenceDescription,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.error || 'Ошибка генерации');
  }

  return response.json();
}

// Image generation not available on free tier
export async function generateFashionImage(_prompt: string): Promise<string | null> {
  return null;
}
