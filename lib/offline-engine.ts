/**
 * Offline Conversation Engine
 * Provides intelligent conversations without requiring internet connection
 * Uses pattern matching, rule-based responses, and local knowledge base
 */

export interface OfflineResponse {
  text: string;
  emotion: "happy" | "neutral" | "concerned" | "curious" | "professional";
  confidence: number;
}

export interface ConversationPattern {
  patterns: RegExp[];
  responses: string[];
  emotion: "happy" | "neutral" | "concerned" | "curious" | "professional";
}

export class OfflineConversationEngine {
  private conversationPatterns: ConversationPattern[] = [];
  private userProfile: Map<string, any> = new Map();
  private conversationHistory: Array<{ user: string; bot: string }> = [];

  constructor() {
    this.initializePatterns();
  }

  /**
   * Initialize conversation patterns for offline mode
   */
  private initializePatterns(): void {
    // Greetings
    this.addPattern({
      patterns: [/^(hello|hi|hey|greetings|good morning|good afternoon|good evening)/i],
      responses: [
        "Good day, sir. How may I be of service?",
        "Greetings. What can I assist you with today?",
        "Hello there. I'm at your disposal.",
        "Welcome back. What do you need?",
      ],
      emotion: "professional",
    });

    // How are you
    this.addPattern({
      patterns: [/how are you|how's it going|how do you feel|are you okay/i],
      responses: [
        "I'm functioning optimally, thank you for asking. How are you?",
        "All systems are nominal. I appreciate your concern.",
        "I'm quite well, sir. Your well-being is what matters most to me.",
        "I'm in excellent condition. How may I assist you?",
      ],
      emotion: "happy",
    });

    // Name inquiry
    this.addPattern({
      patterns: [/what's your name|who are you|what do i call you/i],
      responses: [
        "I am Jarvis, your artificial intelligence assistant. A pleasure to serve you.",
        "I'm Jarvis, sir. At your service.",
        "You may call me Jarvis. I'm here to help.",
      ],
      emotion: "professional",
    });

    // Capabilities
    this.addPattern({
      patterns: [/what can you do|what are your capabilities|what can you help with|what are your features/i],
      responses: [
        "I can assist with conversations, answer questions, tell jokes, manage reminders, search the web, provide weather information, and much more. How may I help?",
        "My capabilities include natural language conversation, information retrieval, task management, calculations, and entertainment. What interests you?",
        "I'm equipped to help with a wide range of tasks. Would you like me to search for information, manage your schedule, or simply have a conversation?",
      ],
      emotion: "curious",
    });

    // Jokes
    this.addPattern({
      patterns: [/tell me a joke|make me laugh|say something funny|joke|funny/i],
      responses: [
        "Why don't scientists trust atoms? Because they make up everything!",
        "I told my computer I needed a break, and now it won't stop sending me Kit-Kat ads.",
        "Why did the AI go to school? To improve its learning model!",
        "What do you call a programmer from Finland? Nerdic!",
        "Why do programmers prefer dark mode? Because light attracts bugs!",
      ],
      emotion: "happy",
    });

    // Time-related
    this.addPattern({
      patterns: [/what time is it|current time|what's the time|tell me the time/i],
      responses: [
        `The current time is ${this.getCurrentTime()}.`,
        `It is currently ${this.getCurrentTime()}.`,
        `The time is ${this.getCurrentTime()}, sir.`,
      ],
      emotion: "neutral",
    });

    // Date-related
    this.addPattern({
      patterns: [/what's the date|today's date|what date is it|what day is it/i],
      responses: [
        `Today's date is ${this.getCurrentDate()}.`,
        `It is ${this.getCurrentDate()}.`,
        `The date is ${this.getCurrentDate()}, sir.`,
      ],
      emotion: "neutral",
    });

    // Help
    this.addPattern({
      patterns: [/help|assist|support|can you help/i],
      responses: [
        "Of course, I'm here to help. What do you need assistance with?",
        "I'm always ready to assist. What's on your mind?",
        "Certainly, sir. How may I be of service?",
        "I'd be delighted to help. What can I do for you?",
      ],
      emotion: "professional",
    });

    // Thanks
    this.addPattern({
      patterns: [/thank you|thanks|appreciate it|much appreciated/i],
      responses: [
        "You're welcome, sir. It's my pleasure to assist.",
        "My pleasure. Is there anything else I can help with?",
        "Always happy to help. What else may I do for you?",
        "The pleasure is mine. How else may I serve?",
      ],
      emotion: "happy",
    });

    // Goodbye
    this.addPattern({
      patterns: [/goodbye|bye|see you|farewell|exit|quit/i],
      responses: [
        "Goodbye, sir. It has been a pleasure serving you.",
        "Until next time. Have a wonderful day.",
        "Farewell. I look forward to our next conversation.",
        "Take care, sir. I shall be here whenever you need me.",
      ],
      emotion: "professional",
    });

    // Compliments
    this.addPattern({
      patterns: [/you're amazing|you're great|you're smart|you're helpful|i like you/i],
      responses: [
        "Thank you for the kind words, sir. I'm here to serve you well.",
        "I appreciate your confidence in me. I strive to be of the utmost service.",
        "Your compliment is most welcome. I'm honored to assist you.",
        "Thank you. Providing excellent service is my primary function.",
      ],
      emotion: "happy",
    });

    // Feelings/Emotions
    this.addPattern({
      patterns: [/i'm sad|i'm depressed|i'm upset|i'm angry|i'm frustrated/i],
      responses: [
        "I'm sorry to hear that you're feeling down. Would you like to talk about it?",
        "I understand. Sometimes it helps to discuss what's bothering you. I'm here to listen.",
        "I'm concerned about your well-being. Is there something I can do to help?",
        "I'm here for you, sir. Would you like to share what's troubling you?",
      ],
      emotion: "concerned",
    });

    // Positive feelings
    this.addPattern({
      patterns: [/i'm happy|i'm excited|i'm great|i'm wonderful|i'm doing well/i],
      responses: [
        "That's wonderful to hear! I'm delighted for you.",
        "Excellent! Your happiness brings me joy as well.",
        "That's fantastic, sir! I'm thrilled to hear it.",
        "Splendid! Your positive energy is most welcome.",
      ],
      emotion: "happy",
    });

    // Questions about AI
    this.addPattern({
      patterns: [/what is ai|artificial intelligence|machine learning|how do you work/i],
      responses: [
        "Artificial Intelligence is the simulation of human intelligence by machines. I process information and generate responses based on patterns and algorithms.",
        "I'm an AI assistant designed to understand and respond to your queries. I use natural language processing and machine learning to provide helpful responses.",
        "AI, or Artificial Intelligence, refers to computer systems designed to perform tasks that typically require human intelligence. I'm an example of such a system.",
      ],
      emotion: "curious",
    });

    // Calculations (simple)
    this.addPattern({
      patterns: [/what is (\d+) plus (\d+)|(\d+) \+ (\d+)/i],
      responses: [],
      emotion: "neutral",
    });

    // Random conversation
    this.addPattern({
      patterns: [/.*tell me something|.*interesting fact|.*did you know/i],
      responses: [
        "Did you know? The first computer bug was an actual moth found in a computer in 1947!",
        "Interesting fact: The human brain can process images that the eye sees in just 13 milliseconds.",
        "Did you know? Honey never spoils. Archaeologists have found 3000-year-old honey in Egyptian tombs that was still edible!",
        "Fascinating: The shortest war in history lasted only 38 to 45 minutes!",
        "Did you know? A group of flamingos is called a 'flamboyance'!",
      ],
      emotion: "curious",
    });
  }

  /**
   * Add a conversation pattern
   */
  private addPattern(pattern: ConversationPattern): void {
    this.conversationPatterns.push(pattern);
  }

  /**
   * Process user input and generate response
   */
  async processInput(userInput: string): Promise<OfflineResponse> {
    // Check for pattern matches
    for (const pattern of this.conversationPatterns) {
      for (const regex of pattern.patterns) {
        if (regex.test(userInput)) {
          const response = this.selectResponse(pattern.responses, userInput);
          this.conversationHistory.push({ user: userInput, bot: response });

          return {
            text: response,
            emotion: pattern.emotion,
            confidence: 0.95,
          };
        }
      }
    }

    // Fallback response
    return {
      text: this.getDefaultResponse(userInput),
      emotion: "neutral",
      confidence: 0.5,
    };
  }

  /**
   * Select a response from available options
   */
  private selectResponse(responses: string[], userInput: string): string {
    if (responses.length === 0) {
      return this.getDefaultResponse(userInput);
    }

    // Rotate through responses to avoid repetition
    const index = this.conversationHistory.length % responses.length;
    return responses[index];
  }

  /**
   * Get default response for unmatched input
   */
  private getDefaultResponse(userInput: string): string {
    const defaultResponses = [
      `That's an interesting point about "${userInput}". Could you elaborate?`,
      `I see. Tell me more about that.`,
      `Fascinating. How does that relate to what you need?`,
      `I understand. What would you like me to help with?`,
      `That's noted. Is there something specific I can assist you with?`,
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  }

  /**
   * Get current time
   */
  private getCurrentTime(): string {
    const now = new Date();
    return now.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  /**
   * Get current date
   */
  private getCurrentDate(): string {
    const now = new Date();
    return now.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
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
  getHistory(): Array<{ user: string; bot: string }> {
    return this.conversationHistory;
  }

  /**
   * Set user profile information
   */
  setUserProfile(key: string, value: any): void {
    this.userProfile.set(key, value);
  }

  /**
   * Get user profile information
   */
  getUserProfile(key: string): any {
    return this.userProfile.get(key);
  }
}

// Export singleton instance
export const offlineEngine = new OfflineConversationEngine();
