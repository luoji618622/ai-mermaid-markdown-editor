
import { GoogleGenAI } from "@google/genai";

// 检查是否有API密钥
const getApiKey = (): string | null => {
  return process.env.API_KEY || process.env.GEMINI_API_KEY || null;
};

// 检查AI功能是否可用
export const isAIAvailable = (): boolean => {
  return getApiKey() !== null;
};

// 懒加载AI实例
let ai: GoogleGenAI | null = null;

const getAI = (): GoogleGenAI => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error("AI功能不可用：未设置API密钥");
  }
  
  if (!ai) {
    ai = new GoogleGenAI({ apiKey });
  }
  
  return ai;
};

export const fixMermaidCode = async (badCode: string): Promise<string> => {
  // 检查AI是否可用
  if (!isAIAvailable()) {
    throw new Error("AI修复功能不可用：请设置GEMINI_API_KEY环境变量");
  }

  const prompt = `Your task is to act as a Mermaid.js syntax expert. I will provide you with a Mermaid diagram code block that has a syntax error. You must analyze it, fix the error, and return ONLY the corrected, valid Mermaid code. Do not provide any explanations, apologies, or surrounding text. Just the code itself.

A very common and critical syntax error in Mermaid is using parentheses '()' inside node text defined with square brackets '[]', for example: 'A[Node (details)]'. This is invalid. The correct way to fix this is to enclose the entire text content in double quotes, like this: 'A["Node (details)"]'. Please pay close attention to this specific rule when fixing the code.

Here is the broken code:

${badCode}`;
  
  try {
    const aiInstance = getAI();
    const response = await aiInstance.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        temperature: 0.1,
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const text = response.text;
    
    // Clean up the response, removing markdown fences if they exist.
    const cleanedText = text.replace(/^```mermaid\s*|```\s*$/g, '').trim();
    
    return cleanedText;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("AI服务调用失败，请检查网络连接和API密钥");
  }
};
