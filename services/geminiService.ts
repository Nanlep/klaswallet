
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  constructor() {}

  async getFinancialAdvice(userHistory: string, query: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `
          CONTEXT: Senior Financial Analyst for KlasWallet.
          USER DATA: ${userHistory}
          QUERY: ${query}
          MARKET: BTC/USD volatility is high.
          
          TASK: Provide a sharp, institutional-grade strategy summary.
          LIMIT: Under 50 words. No boilerplate legal disclaimers. Focus on liquidity and hedging.
        `,
        config: {
          thinkingConfig: { thinkingBudget: 4000 }
        }
      });
      return response.text || "Market analysis is currently offline.";
    } catch (error) {
      console.error("Gemini Advisor Error:", error);
      return "Strategic uplink failed. Reconnecting...";
    }
  }

  async categorizeTransaction(description: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Categorize: "${description}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              category: { type: Type.STRING }
            },
            required: ["category"]
          }
        }
      });
      const result = JSON.parse(response.text?.trim() || '{"category": "Other"}');
      return result.category;
    } catch {
      return "General";
    }
  }
}
