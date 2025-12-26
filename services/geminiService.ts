
import { GoogleGenAI, Type } from "@google/genai";

export interface InsightResult {
  text: string;
  sources: { title: string; uri: string }[];
}

export class GeminiService {
  constructor() {}

  async getMarketInsights(query: string): Promise<InsightResult> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: `
          Analyze the following market query for a KlasWallet institutional user: "${query}".
          Focus on current market sentiment for BTC and NGN. 
          Keep the summary under 100 words.
        `,
        config: { 
          thinkingConfig: { thinkingBudget: 4000 },
          tools: [{ googleSearch: {} }]
        }
      });

      const text = response.text || "Market data currently unavailable.";
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      
      const sources = chunks
        .filter(chunk => chunk.web)
        .map(chunk => ({
          title: chunk.web?.title || "Market Source",
          uri: chunk.web?.uri || ""
        }));

      return { text, sources };
    } catch (error) {
      console.error("Gemini Error:", error);
      return { text: "Strategic uplink interrupted. Using cached local data.", sources: [] };
    }
  }

  async getSupportResponse(query: string): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `
          ROLE: Helpful KlasWallet Support Agent.
          POLICIES: KYC takes 2-24 hours. Withdrawals are instant but depend on the blockchain. 
          VASP LICENSE: NG-VASP-2024-429-A.
          QUERY: ${query}
        `,
        config: { systemInstruction: "You are a friendly support bot for a crypto-fiat app in Africa. Be concise." }
      });
      return response.text || "I'm here to help. Could you repeat that?";
    } catch {
      return "Support system busy. Try again shortly.";
    }
  }

  async generateReleaseNotes(version: string, changes: string[]): Promise<string> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate Play Store release notes for version ${version}. Features: ${changes.join(', ')}. Keep it exciting but professional.`
    });
    return response.text || "Minor improvements and bug fixes.";
  }
}
