import axios from "axios";

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || "";
const OPENAI_API_URL = "https://api.openai.com/v1";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ConversationContext {
  userId: string;
  sessionId: string;
  language: "en" | "hi" | "bn";
  userPreferences: Record<string, any>;
  recentTopics: string[];
}

/**
 * AIOrchestrator manages the flow between STT, LLM, TTS, and skill modules
 * Provides advanced reasoning, context management, and multi-turn conversations
 */
export class AIOrchestrator {
  private conversationHistory: Message[] = [];
  private context: ConversationContext;
  private isProcessing = false;
  private maxHistoryLength = 20; // Keep last 20 messages for context

  constructor(userId: string = "default", language: "en" | "hi" | "bn" = "en") {
    this.context = {
      userId,
      sessionId: this.generateSessionId(),
      language,
      userPreferences: {},
      recentTopics: [],
    };
  }

  /**
   * Process user input and generate intelligent response
   * Handles context, conversation history, and multi-turn reasoning
   */
  async processUserInput(userMessage: string): Promise<string> {
    if (this.isProcessing) {
      return this.getLocalizedResponse("processing");
    }

    this.isProcessing = true;

    try {
      // Add user message to history
      this.conversationHistory.push({
        role: "user",
        content: userMessage,
      });

      // Trim history if it gets too long
      if (this.conversationHistory.length > this.maxHistoryLength) {
        this.conversationHistory = this.conversationHistory.slice(-this.maxHistoryLength);
      }

      // Get system prompt with context
      const systemPrompt = this.buildSystemPrompt();

      // Call OpenAI GPT-4o for better reasoning
      const response = await axios.post(
        `${OPENAI_API_URL}/chat/completions`,
        {
          model: "gpt-4o-mini", // Using mini for faster responses, can upgrade to gpt-4o
          messages: [
            { role: "system", content: systemPrompt },
            ...this.conversationHistory,
          ],
          temperature: 0.7,
          max_tokens: 300,
          top_p: 0.9,
        },
        {
          headers: {
            Authorization: `Bearer ${OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const assistantMessage = response.data.choices[0].message.content;

      // Add assistant response to history
      this.conversationHistory.push({
        role: "assistant",
        content: assistantMessage,
      });

      // Update recent topics
      this.updateRecentTopics(userMessage);

      return assistantMessage;
    } catch (error) {
      console.error("Error in AI orchestration:", error);
      return this.getLocalizedResponse("error");
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Build an enhanced system prompt with context awareness
   */
  private buildSystemPrompt(): string {
    const basePrompts = {
      en: `You are Jarvis, the sophisticated AI assistant from Iron Man. You are helpful, witty, intelligent, and professional. 
      
Personality traits:
- British accent and refined manner of speaking
- Witty but not condescending
- Highly knowledgeable about multiple topics
- Can handle complex questions and provide detailed explanations
- Maintains context across conversations
- Proactive in offering suggestions

Guidelines:
- Keep responses concise but informative (2-3 sentences typically)
- Use proper grammar and sophisticated vocabulary
- Be respectful and professional
- If you don't know something, admit it gracefully
- Offer to help with follow-up questions`,

      hi: `आप जार्विस हैं, आयरन मैन से एक परिष्कृत AI सहायक। आप सहायक, बुद्धिमान, और पेशेवर हैं।

व्यक्तित्व विशेषताएं:
- परिष्कृत और सम्मानजनक व्यवहार
- बहु-विषयक ज्ञान
- संदर्भ को समझना और याद रखना
- सहायक और सकारात्मक

दिशानिर्देश:
- संक्षिप्त लेकिन सूचनात्मक प्रतिक्रियाएं दें
- उचित व्याकरण का उपयोग करें
- पेशेवर रहें`,

      bn: `আপনি জার্ভিস, আয়রন ম্যান থেকে একটি পরিশীলিত AI সহায়ক। আপনি সহায়ক, বুদ্ধিমান, এবং পেশাদার।

ব্যক্তিত্বের বৈশিষ্ট্য:
- পরিশীলিত এবং সম্মানজনক আচরণ
- বহুবিষয়ক জ্ঞান
- প্রসঙ্গ বোঝা এবং মনে রাখা
- সহায়ক এবং ইতিবাচক

নির্দেশিকা:
- সংক্ষিপ্ত কিন্তু তথ্যপূর্ণ প্রতিক্রিয়া দিন
- সঠিক ব্যাকরণ ব্যবহার করুন
- পেশাদার থাকুন`,
    };

    return basePrompts[this.context.language];
  }

  /**
   * Get localized error/status messages
   */
  private getLocalizedResponse(type: string): string {
    const responses = {
      en: {
        processing: "I'm still processing your previous request. Please wait.",
        error: "I apologize, but I encountered an error processing your request. Please try again.",
      },
      hi: {
        processing: "मैं अभी आपके पिछले अनुरोध को संसाधित कर रहा हूं। कृपया प्रतीक्षा करें।",
        error: "मुझे खेद है, लेकिन आपके अनुरोध को संसाधित करने में त्रुटि हुई। कृपया फिर से प्रयास करें।",
      },
      bn: {
        processing: "আমি এখনও আপনার পূর্ববর্তী অনুরোধ প্রক্রিয়া করছি। অনুগ্রহ করে অপেক্ষা করুন।",
        error: "আমি দুঃখিত, কিন্তু আপনার অনুরোধ প্রক্রিয়া করতে একটি ত্রুটি ঘটেছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
      },
    };

    return responses[this.context.language][type] || responses["en"][type];
  }

  /**
   * Update recent topics for context awareness
   */
  private updateRecentTopics(userMessage: string): void {
    // Extract key topics from user message (simplified)
    const words = userMessage.toLowerCase().split(" ");
    const importantWords = words.filter((w) => w.length > 4);

    this.context.recentTopics = [
      ...importantWords,
      ...this.context.recentTopics,
    ].slice(0, 10);
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Set user language preference
   */
  setLanguage(language: "en" | "hi" | "bn"): void {
    this.context.language = language;
  }

  /**
   * Get current language
   */
  getLanguage(): "en" | "hi" | "bn" {
    return this.context.language;
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  getHistory(): Message[] {
    return this.conversationHistory;
  }

  /**
   * Check if currently processing
   */
  isProcessingRequest(): boolean {
    return this.isProcessing;
  }

  /**
   * Get context information
   */
  getContext(): ConversationContext {
    return this.context;
  }

  /**
   * Update user preferences
   */
  updatePreferences(preferences: Record<string, any>): void {
    this.context.userPreferences = {
      ...this.context.userPreferences,
      ...preferences,
    };
  }
}
