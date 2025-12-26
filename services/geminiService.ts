
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
          
          TASK: Provide a sharp strategy summary under 50 words. Focus on liquidity.
        `,
        config: { thinkingConfig: { thinkingBudget: 4000 } }
      });
      return response.text || "Strategic analysis offline.";
    } catch (error) {
      return "Strategic uplink failed.";
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
