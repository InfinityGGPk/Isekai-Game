import { GoogleGenAI } from "@google/genai";
import { GameState } from '../types';
import { GAME_MASTER_PROMPT } from '../constants';

type ChatHistory = { role: string, parts: { text: string }[] }[];

const MAX_RETRIES = 3;
const INITIAL_BACKOFF_MS = 2000;

export const runGameTurn = async (history: ChatHistory): Promise<string> => {
    let lastError: any = null;

    for (let i = 0; i < MAX_RETRIES; i++) {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: history,
                config: {
                    systemInstruction: GAME_MASTER_PROMPT,
                }
            });

            // The .text accessor will throw an error if the prompt was blocked,
            // which will be caught by the `catch` block.
            const text = response.text;

            // It's still possible to get an empty string for other reasons.
            if (!text) {
                 if (response.candidates?.[0]?.finishReason && response.candidates[0].finishReason !== 'STOP') {
                    throw new Error(`A geração de texto foi interrompida. Motivo: ${response.candidates[0].finishReason}`);
                 }
                 throw new Error("A IA retornou uma resposta vazia.");
            }

            return text; // Success, exit the loop
        } catch (error) {
            lastError = error;
            const errorString = JSON.stringify(error).toLowerCase();
            const isRetryable = errorString.includes('503') || errorString.includes('overloaded') || errorString.includes('unavailable');

            if (isRetryable && i < MAX_RETRIES - 1) {
                const backoffTime = INITIAL_BACKOFF_MS * Math.pow(2, i);
                console.warn(`API error (retryable), retrying in ${backoffTime}ms... (Attempt ${i + 1}/${MAX_RETRIES})`, error);
                await new Promise(resolve => setTimeout(resolve, backoffTime));
            } else {
                // Non-retryable error or max retries reached, break the loop to throw.
                break;
            }
        }
    }

    // If the loop finished due to errors, process and throw the last known error.
    console.error("Error calling Gemini API after all retries:", lastError);

    const finalErrorString = JSON.stringify(lastError).toLowerCase();

    if (finalErrorString.includes('503') || finalErrorString.includes('overloaded') || finalErrorString.includes('unavailable')) {
        throw new Error("O Mestre do Jogo está sobrecarregado. Por favor, tente novamente em alguns instantes.");
    }
    
    if (finalErrorString.includes('resource_exhausted') || finalErrorString.includes('429')) {
        throw new Error("Cota da API excedida. Por favor, verifique seu plano e detalhes de faturamento.");
    }
    
    if (lastError instanceof Error && (lastError.message.toLowerCase().includes("blocked") || lastError.message.toLowerCase().includes("safety"))) {
        throw new Error("A resposta da IA foi bloqueada por razões de segurança. Tente uma ação diferente.");
    }

    if (lastError instanceof Error) {
        throw new Error(`Falha na comunicação com a IA: ${lastError.message}`);
    }

    throw new Error("Falha na comunicação com a IA. Verifique sua chave de API e a conexão.");
};

export const generateImageFromPrompt = async (prompt: string): Promise<string> => {
    try {
        console.log(`Gerando imagem com o prompt: ${prompt}`);
        
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        const response = await ai.models.generateImages({
            model: 'imagen-3.0-generate-002',
            prompt: prompt,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/jpeg',
                aspectRatio: '16:9',
            },
        });

        // Use optional chaining for safer access
        const image = response.generatedImages?.[0]?.image;

        if (!image || !image.imageBytes) {
            console.error("Image generation response was empty or invalid:", response);
            throw new Error("A API de imagem não retornou uma imagem válida.");
        }

        const base64ImageBytes: string = image.imageBytes;
        
        const imageUrl = `data:image/jpeg;base64,${base64ImageBytes}`;
        return imageUrl;

    } catch (error) {
        console.error("Error calling Image Generation API:", error);
        if (error instanceof Error) {
             // Check for specific safety/blocking error messages from the API
             if (error.message.toLowerCase().includes('blocked') || error.message.toLowerCase().includes('safety')) {
                 throw new Error("A geração da imagem foi bloqueada por razões de segurança.");
             }
             throw new Error(`Falha ao gerar a imagem da cena: ${error.message}`);
        }
        throw new Error("Falha ao gerar a imagem da cena. Causa desconhecida.");
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