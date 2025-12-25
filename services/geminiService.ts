import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  // FIX: Removed internal 'ai' state to ensure GoogleGenAI is instantiated right before 
  // each API call, allowing the use of the most up-to-date API key from the environment 
  // and preventing issues with component-level instantiation.
  
  constructor() {}

  async getFinancialAdvice(userHistory: string, query: string): Promise<string> {
    // FIX: Instantiate GoogleGenAI right before the API call to ensure the latest API key is used.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    try {
      const response = await ai.models.generateContent({
        // FIX: Upgraded to gemini-3-pro-preview for complex reasoning tasks like financial strategy
        model: 'gemini-3-pro-preview',
        contents: `
          User Transaction History: ${userHistory}
          User Question: ${query}
          Market Context: BTC is trending upward, USD is stable.
          
          You are a senior financial terminal AI for KlasWallet. 
          Analyze the user's spending habits and provide actionable (but not legal) crypto-fiat strategy advice.
          Keep responses under 60 words and highly technical yet accessible.
        `,
      });
      // FIX: response.text is a getter property
      return response.text || "I'm sorry, I couldn't process that request right now.";
    } catch (error) {
      console.error("Gemini Error:", error);
      return "Unable to reach the AI assistant. Please try again later.";
    }
  }

  async analyzeMarketSwap(from: string, to: string, rate: number): Promise<string> {
    // FIX: Instantiate GoogleGenAI right before the API call.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Evaluate a swap of ${from} to ${to} at rate ${rate}. Is this a typical market move? Give a 10 word risk summary.`,
    });
    // FIX: response.text is a getter property
    return response.text || "Market stable.";
  }

  async categorizeTransaction(description: string): Promise<string> {
    // FIX: Instantiate GoogleGenAI right before the API call.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Categorize this transaction description into one word (e.g., Food, Crypto, Utilities, Rent): "${description}"`,
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
    // FIX: Using .text property and trimming as recommended for JSON responses.
    const result = JSON.parse(response.text?.trim() || '{"category": "Other"}');
    return result.category;
  }
}