
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

export const fixMermaidCode = async (badCode: string): Promise<string> => {
  const prompt = `Your task is to act as a Mermaid.js syntax expert. I will provide you with a Mermaid diagram code block that has a syntax error. You must analyze it, fix the error, and return ONLY the corrected, valid Mermaid code. Do not provide any explanations, apologies, or surrounding text. Just the code itself.

A very common and critical syntax error in Mermaid is using parentheses '()' inside node text defined with square brackets '[]', for example: 'A[Node (details)]'. This is invalid. The correct way to fix this is to enclose the entire text content in double quotes, like this: 'A["Node (details)"]'. Please pay close attention to this specific rule when fixing the code.

Here is the broken code:

${badCode}`;
  
  try {
    const response = await ai.models.generateContent({
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
    throw new Error("Failed to get a response from the AI service.");
  }
};
