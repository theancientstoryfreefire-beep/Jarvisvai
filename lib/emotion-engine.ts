/**
 * Emotion Engine
 * Detects user emotions from text and generates emotionally intelligent responses
 * Provides emotional context to conversations
 */

export type EmotionType =
  | "happy"
  | "sad"
  | "angry"
  | "confused"
  | "excited"
  | "neutral"
  | "concerned"
  | "grateful";

export interface EmotionAnalysis {
  emotion: EmotionType;
  intensity: number; // 0-1
  keywords: string[];
  confidence: number; // 0-1
}

export interface EmotionalResponse {
  text: string;
  jarvisEmotion: "happy" | "neutral" | "concerned" | "curious" | "professional";
  userEmotion: EmotionType;
  emotionalContext: string;
}

export class EmotionEngine {
  private emotionKeywords: Map<EmotionType, string[]> = new Map();
  private emotionalResponses: Map<EmotionType, string[]> = new Map();
  private userEmotionHistory: EmotionAnalysis[] = [];

  constructor() {
    this.initializeEmotionKeywords();
    this.initializeEmotionalResponses();
  }

  /**
   * Initialize emotion keywords for detection
   */
  private initializeEmotionKeywords(): void {
    this.emotionKeywords.set("happy", [
      "happy",
      "joyful",
      "excited",
      "great",
      "wonderful",
      "amazing",
      "awesome",
      "fantastic",
      "love",
      "brilliant",
      "excellent",
      "delighted",
      "thrilled",
      "ecstatic",
    ]);

    this.emotionKeywords.set("sad", [
      "sad",
      "depressed",
      "unhappy",
      "miserable",
      "down",
      "blue",
      "heartbroken",
      "devastated",
      "disappointed",
      "gloomy",
      "melancholy",
      "sorrowful",
    ]);

    this.emotionKeywords.set("angry", [
      "angry",
      "furious",
      "mad",
      "rage",
      "frustrated",
      "annoyed",
      "irritated",
      "livid",
      "enraged",
      "upset",
      "bitter",
    ]);

    this.emotionKeywords.set("confused", [
      "confused",
      "puzzled",
      "bewildered",
      "lost",
      "unclear",
      "uncertain",
      "don't understand",
      "what",
      "huh",
      "perplexed",
      "baffled",
    ]);

    this.emotionKeywords.set("excited", [
      "excited",
      "thrilled",
      "pumped",
      "stoked",
      "psyched",
      "eager",
      "anticipating",
      "looking forward",
      "can't wait",
      "energized",
    ]);

    this.emotionKeywords.set("concerned", [
      "worried",
      "concerned",
      "anxious",
      "nervous",
      "stressed",
      "afraid",
      "scared",
      "terrified",
      "uneasy",
      "apprehensive",
    ]);

    this.emotionKeywords.set("grateful", [
      "thank you",
      "thanks",
      "grateful",
      "appreciate",
      "appreciated",
      "thankful",
      "obliged",
      "indebted",
    ]);
  }

  /**
   * Initialize emotionally intelligent responses
   */
  private initializeEmotionalResponses(): void {
    this.emotionalResponses.set("happy", [
      "That's wonderful! I'm delighted to hear it.",
      "Your happiness brings me joy as well.",
      "Excellent! That's fantastic news.",
      "I'm thrilled for you, sir.",
    ]);

    this.emotionalResponses.set("sad", [
      "I'm sorry to hear that you're feeling down. Would you like to talk about it?",
      "I understand. Sometimes it helps to discuss what's bothering you.",
      "I'm here for you, sir. Your well-being matters to me.",
      "Please know that I'm here to listen and support you.",
    ]);

    this.emotionalResponses.set("angry", [
      "I sense your frustration. Would you like to discuss what's troubling you?",
      "I understand you're upset. Let's talk about how I can help.",
      "Your feelings are valid. How can I assist you in resolving this?",
      "I'm here to help. What can I do to ease your frustration?",
    ]);

    this.emotionalResponses.set("confused", [
      "I understand your confusion. Let me clarify that for you.",
      "No problem at all. Let me explain that more clearly.",
      "I see the confusion. Allow me to break this down for you.",
      "That's a fair question. Let me provide more detail.",
    ]);

    this.emotionalResponses.set("excited", [
      "Your enthusiasm is contagious! Tell me more about it.",
      "That's wonderful! I'm excited to help you with this.",
      "Your energy is inspiring! What would you like to do?",
      "Fantastic! Let's make this happen together.",
    ]);

    this.emotionalResponses.set("concerned", [
      "I understand your concern. Let me help ease your worries.",
      "That's a valid concern. Here's what I can do to help.",
      "I'm here to support you through this. What do you need?",
      "Your concerns are important to me. Let's address them together.",
    ]);

    this.emotionalResponses.set("grateful", [
      "You're most welcome, sir. It's my pleasure to serve you.",
      "The pleasure is entirely mine. How else may I assist?",
      "I'm honored to help. Is there anything else you need?",
      "Your gratitude means a great deal to me.",
    ]);

    this.emotionalResponses.set("neutral", [
      "I understand. How can I assist you?",
      "That's noted. What would you like to do?",
      "I see. What can I help with?",
      "Understood. What's your next request?",
    ]);
  }

  /**
   * Analyze emotion from user input
   */
  analyzeEmotion(userInput: string): EmotionAnalysis {
    const lowerInput = userInput.toLowerCase();
    const emotionScores: Map<EmotionType, number> = new Map();
    const foundKeywords: string[] = [];

    // Score each emotion
    for (const [emotion, keywords] of this.emotionKeywords) {
      let score = 0;
      const matchedKeywords: string[] = [];

      for (const keyword of keywords) {
        if (lowerInput.includes(keyword)) {
          score += 1;
          matchedKeywords.push(keyword);
        }
      }

      if (score > 0) {
        emotionScores.set(emotion, score);
        foundKeywords.push(...matchedKeywords);
      }
    }

    // Find dominant emotion
    let dominantEmotion: EmotionType = "neutral";
    let maxScore = 0;

    for (const [emotion, score] of emotionScores) {
      if (score > maxScore) {
        maxScore = score;
        dominantEmotion = emotion;
      }
    }

    // Calculate intensity and confidence
    const totalKeywords = foundKeywords.length;
    const intensity = Math.min(totalKeywords / 5, 1); // Normalize to 0-1
    const confidence = maxScore > 0 ? Math.min(maxScore / 3, 1) : 0;

    const analysis: EmotionAnalysis = {
      emotion: dominantEmotion,
      intensity,
      keywords: [...new Set(foundKeywords)],
      confidence,
    };

    // Store in history
    this.userEmotionHistory.push(analysis);

    return analysis;
  }

  /**
   * Generate emotionally intelligent response
   */
  generateEmotionalResponse(
    userEmotion: EmotionType,
    baseResponse: string
  ): EmotionalResponse {
    // Select appropriate Jarvis emotion
    let jarvisEmotion: "happy" | "neutral" | "concerned" | "curious" | "professional";

    switch (userEmotion) {
      case "happy":
      case "excited":
        jarvisEmotion = "happy";
        break;
      case "sad":
      case "concerned":
        jarvisEmotion = "concerned";
        break;
      case "angry":
        jarvisEmotion = "professional"; // Calm and professional
        break;
      case "confused":
        jarvisEmotion = "curious";
        break;
      case "grateful":
        jarvisEmotion = "happy";
        break;
      default:
        jarvisEmotion = "neutral";
    }

    // Get emotional context
    const emotionalContext = this.getEmotionalContext(userEmotion);

    // Get appropriate response
    const responses = this.emotionalResponses.get(userEmotion) || [];
    const emotionalPrefix =
      responses.length > 0
        ? responses[Math.floor(Math.random() * responses.length)]
        : "";

    // Combine responses
    const finalResponse =
      emotionalPrefix + (emotionalPrefix ? " " : "") + baseResponse;

    return {
      text: finalResponse,
      jarvisEmotion,
      userEmotion,
      emotionalContext,
    };
  }

  /**
   * Get emotional context for the conversation
   */
  private getEmotionalContext(emotion: EmotionType): string {
    const contexts = {
      happy: "The user is in a positive mood. Maintain enthusiasm and positivity.",
      sad: "The user is experiencing sadness. Show empathy and support.",
      angry: "The user is frustrated. Remain calm and professional.",
      confused: "The user is uncertain. Provide clear, detailed explanations.",
      excited: "The user is enthusiastic. Match their energy and excitement.",
      concerned: "The user is worried. Provide reassurance and solutions.",
      grateful: "The user is appreciative. Acknowledge their gratitude warmly.",
      neutral: "The user is neutral. Maintain a professional tone.",
    };

    return contexts[emotion] || "Maintain a professional and helpful tone.";
  }

  /**
   * Get user's overall emotional trend
   */
  getEmotionalTrend(): EmotionType {
    if (this.userEmotionHistory.length === 0) {
      return "neutral";
    }

    // Get last 5 emotions
    const recentEmotions = this.userEmotionHistory.slice(-5);
    const emotionCounts: Map<EmotionType, number> = new Map();

    for (const analysis of recentEmotions) {
      const count = emotionCounts.get(analysis.emotion) || 0;
      emotionCounts.set(analysis.emotion, count + 1);
    }

    // Find most common emotion
    let dominantEmotion: EmotionType = "neutral";
    let maxCount = 0;

    for (const [emotion, count] of emotionCounts) {
      if (count > maxCount) {
        maxCount = count;
        dominantEmotion = emotion;
      }
    }

    return dominantEmotion;
  }

  /**
   * Get average emotion intensity
   */
  getAverageIntensity(): number {
    if (this.userEmotionHistory.length === 0) {
      return 0;
    }

    const sum = this.userEmotionHistory.reduce(
      (acc, analysis) => acc + analysis.intensity,
      0
    );
    return sum / this.userEmotionHistory.length;
  }

  /**
   * Clear emotion history
   */
  clearHistory(): void {
    this.userEmotionHistory = [];
  }

  /**
   * Get emotion history
   */
  getHistory(): EmotionAnalysis[] {
    return this.userEmotionHistory;
  }
}

// Export singleton instance
export const emotionEngine = new EmotionEngine();
