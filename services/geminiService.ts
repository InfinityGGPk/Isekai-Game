
import { GoogleGenAI } from "@google/genai";
import { GameState } from '../types';
import { GAME_MASTER_PROMPT } from '../constants';

type ChatHistory = { role: string, parts: { text: string }[] }[];

export const runGameTurn = async (history: ChatHistory): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: history,
            config: {
                systemInstruction: GAME_MASTER_PROMPT,
            }
        });

        // The .text accessor will throw an error if the prompt was blocked.
        // The catch block below will handle it.
        const text = response.text;

        // Check for other non-blocking issues, like an empty response or incomplete generation.
        if (!text) {
             if (response.promptFeedback?.blockReason) {
                throw new Error(`A IA bloqueou a resposta. Motivo: ${response.promptFeedback.blockReason}`);
             }
             if (response.candidates?.[0]?.finishReason && response.candidates[0].finishReason !== 'STOP') {
                throw new Error(`A geração de texto foi interrompida. Motivo: ${response.candidates[0].finishReason}`);
             }
             throw new Error("A IA retornou uma resposta vazia.");
        }

        return text;
    } catch (error) {
        console.error("Error calling Gemini API:", error);

        // The error from the API might be an object, not a standard Error.
        // We stringify it to safely check for keywords.
        const errorString = JSON.stringify(error);

        if (errorString.includes('RESOURCE_EXHAUSTED') || errorString.includes('429')) {
            throw new Error("Cota da API excedida. Por favor, verifique seu plano e detalhes de faturamento.");
        }
        
        // The .text accessor throws an error message that includes "blocked" for safety reasons.
        if (error instanceof Error && error.message.toLowerCase().includes("blocked")) {
            throw new Error("A resposta da IA foi bloqueada por razões de segurança. Tente uma ação diferente.");
        }

        // Generic fallback for other Error instances.
        if (error instanceof Error) {
            throw new Error(`Falha na comunicação com a IA: ${error.message}`);
        }

        // Fallback for non-Error objects that were not caught above.
        throw new Error("Falha na comunicação com a IA. Verifique sua chave de API e a conexão.");
    }
};

export const extractJsonAndNarrative = (responseText: string): { narrative: string, jsonState: GameState | null } => {
    const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = responseText.match(jsonBlockRegex);

    if (match && match[1]) {
        const narrative = responseText.substring(0, match.index).trim();
        try {
            const jsonState = JSON.parse(match[1]);
            return { narrative, jsonState };
        } catch (error) {
            console.error("Failed to parse JSON state:", error, "Raw content:", match[1]);
            return { narrative: `Erro ao processar a resposta da IA. O bloco JSON estava malformado.\n\n${responseText}`, jsonState: null };
        }
    }

    return { narrative: responseText, jsonState: null };
};
