import { GoogleGenAI } from "@google/genai";
import { Source, ChatMessage, NoteType } from "@/types";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '' });

const MODEL_NAME = 'gemini-2.5-flash';

/**
 * Constructs the system prompt by combining all sources.
 * This simulates the RAG "Context Window" approach used by NotebookLM.
 */
const buildContextPrompt = (sources: Source[]): string => {
  if (sources.length === 0) return "";

  let context = "You are OpenNotebookLM, an AI research assistant powered by Gemini. Use the following sources to answer the user's questions. Do not make up information outside of these sources. If the answer is not in the sources, state that clearly.\n\n--- SOURCES ---\n\n";

  sources.forEach((source, index) => {
    context += `[Source ${index + 1}: ${source.title}]\n${source.content}\n\n`;
  });

  context += "--- END SOURCES ---\n";
  return context;
};

export const streamChatResponse = async (
  sources: Source[],
  history: ChatMessage[],
  newMessage: string,
  onChunk: (text: string) => void
): Promise<string> => {
  try {
    const systemInstruction = buildContextPrompt(sources);

    // Transform history for the API
    // We only take the last 10 messages to keep context efficient, though 2.5 Flash has a huge window.
    const recentHistory = history.slice(-10).map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));

    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.4, // Lower temperature for more grounded answers
      },
      history: recentHistory
    });

    const result = await chat.sendMessageStream({ message: newMessage });

    let fullText = "";
    for await (const chunk of result) {
      if (chunk.text) {
        fullText += chunk.text;
        onChunk(chunk.text);
      }
    }
    return fullText;

  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm sorry, I encountered an error while processing your request. Please ensure you have a valid API Key.";
  }
};

export const generateStudioContent = async (
  sources: Source[],
  type: NoteType
): Promise<string> => {
  try {
    const context = buildContextPrompt(sources);
    let prompt = "";

    switch (type) {
      case NoteType.SUMMARY:
        prompt = "Create a concise summary of the provided sources. Key bullet points and a concluding paragraph.";
        break;
      case NoteType.FAQ:
        prompt = "Generate a list of Frequently Asked Questions (FAQ) based on the sources, along with their answers.";
        break;
      case NoteType.STUDY_GUIDE:
        prompt = "Create a study guide based on the sources. Include key terms, definitions, and quiz questions.";
        break;
      case NoteType.PODCAST:
        prompt = "Generate a script for a two-person 'Audio Overview' podcast discussing these sources. Use 'Host 1' and 'Host 2' as speaker labels. Make it conversational, engaging, and easy to listen to. Focus on the most surprising or important insights.";
        break;
      default:
        prompt = "Summarize the key information.";
    }

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: [
        { role: 'user', parts: [{ text: `${context}\n\nTask: ${prompt}` }] }
      ]
    });

    return response.text || "Could not generate content.";

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return "Error generating content.";
  }
};