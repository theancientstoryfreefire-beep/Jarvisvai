import axios from "axios";

const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || "";
const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || "";
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";
const OPENAI_API_URL = "https://api.openai.com/v1";

// Professional male voice ID for Jarvis
const JARVIS_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

interface Message {
  role: "user" | "assistant";
  content: string;
}

class JarvisService {
  private conversationHistory: Message[] = [];
  private language: "en" | "hi" | "bn" = "en";
  private isProcessing = false;

  setLanguage(lang: "en" | "hi" | "bn") {
    this.language = lang;
  }

  getLanguage() {
    return this.language;
  }

  async synthesizeVoice(text: string): Promise<ArrayBuffer> {
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ElevenLabs API key not configured");
    }

    try {
      const response = await axios.post(
        `${ELEVENLABS_API_URL}/text-to-speech/${JARVIS_VOICE_ID}`,
        {
          text,
          model_id: "eleven_monolingual_v1",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        },
        {
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error synthesizing voice:", error);
      throw error;
    }
  }

  async getAIResponse(userMessage: string): Promise<string> {
    if (this.isProcessing) {
      return "I'm still processing your previous request. Please wait.";
    }

    this.isProcessing = true;

    try {
      this.conversationHistory.push({
        role: "user",
        content: userMessage,
      });

      const systemPrompt = this.getSystemPrompt();

      // Call OpenAI GPT API
      const response = await axios.post(
        `${OPENAI_API_URL}/chat/completions`,
        {
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: systemPrompt },
            ...this.conversationHistory,
          ],
          temperature: 0.7,
          max_tokens: 150,
        },
        {
          headers: {
            "Authorization": `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const assistantMessage =
        response.data.choices[0].message.content;

      this.conversationHistory.push({
        role: "assistant",
        content: assistantMessage,
      });

      return assistantMessage;
    } catch (error) {
      console.error("Error getting AI response:", error);
      return "I apologize, but I encountered an error processing your request. Please try again.";
    } finally {
      this.isProcessing = false;
    }
  }

  private getSystemPrompt(): string {
    const languagePrompts = {
      en: "You are Jarvis, the sophisticated AI assistant from Iron Man. You are helpful, witty, intelligent, and professional. Respond concisely and intelligently to user queries. Keep responses brief (1-2 sentences). You have a British accent and refined manner of speaking.",
      hi: "आप जार्विस हैं, आयरन मैन से एक परिष्कृत AI सहायक। आप सहायक, बुद्धिमान और पेशेवर हैं। संक्षिप्त और बुद्धिमानी से जवाब दें। आपके जवाब 1-2 वाक्यों में होने चाहिए।",
      bn: "আপনি জার্ভিস, আয়রন ম্যান থেকে একটি পরিশীলিত AI সহায়ক। আপনি সহায়ক, বুদ্ধিমান এবং পেশাদার। সংক্ষিপ্ত এবং বুদ্ধিমানভাবে উত্তর দিন। আপনার উত্তর ১-২ বাক্যে হওয়া উচিত।",
    };

    return languagePrompts[this.language];
  }

  clearHistory() {
    this.conversationHistory = [];
  }

  getHistory() {
    return this.conversationHistory;
  }

  isProcessingRequest() {
    return this.isProcessing;
  }
}

export const jarvisService = new JarvisService();
