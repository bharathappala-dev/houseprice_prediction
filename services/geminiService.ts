import { GoogleGenAI } from "@google/genai";
import { FeatureImportance, ModelMetrics } from "../types";

const GEMINI_API_KEY = process.env.API_KEY || ''; 

// We initialize this lazily to allow the app to load even if key is missing initially (though it is required for this specific feature)
let ai: GoogleGenAI | null = null;

if (GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
}

export const generateModelInsights = async (
  metrics: ModelMetrics,
  features: FeatureImportance[],
  targetName: string
): Promise<string> => {
  if (!ai) {
    return "API Key is missing. Please ensure the API_KEY environment variable is set.";
  }

  const prompt = `
    I have trained a linear regression model to predict '${targetName}'.
    
    Here are the model performance metrics:
    - R-Squared (R2): ${metrics.r2.toFixed(4)}
    - Root Mean Squared Error (RMSE): ${metrics.rmse.toFixed(2)}
    
    Here are the top feature coefficients (importance):
    ${features.map(f => `- ${f.name}: ${f.importance.toFixed(4)}`).join('\n')}
    
    Please provide a concise, user-friendly analysis of these results. 
    1. Interpret the R2 score (is it good?).
    2. Explain which features drive the price up or down the most based on the coefficients.
    3. Give a brief recommendation on data quality or what else could be collected to improve the model.
    
    Keep the tone professional but accessible to a non-technical user.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || "No insights generated.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate insights due to an API error.";
  }
};