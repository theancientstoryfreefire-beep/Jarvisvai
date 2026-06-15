/**
 * Skill System for Jarvis AI
 * Provides a modular architecture for adding new capabilities
 */

export interface SkillContext {
  userId: string;
  language: "en" | "hi" | "bn";
  userMessage: string;
  conversationHistory: any[];
}

export interface SkillResult {
  handled: boolean;
  response?: string;
  requiresAI?: boolean; // If true, pass to main AI for response
  metadata?: Record<string, any>;
}

export abstract class BaseSkill {
  abstract name: string;
  abstract description: string;
  abstract keywords: string[];
  abstract language: "en" | "hi" | "bn";

  /**
   * Check if this skill can handle the user message
   */
  abstract canHandle(message: string): boolean;

  /**
   * Execute the skill
   */
  abstract execute(context: SkillContext): Promise<SkillResult>;

  /**
   * Helper: Check if message contains any keywords
   */
  protected hasKeywords(message: string, keywords: string[]): boolean {
    const lowerMessage = message.toLowerCase();
    return keywords.some((keyword) =>
      lowerMessage.includes(keyword.toLowerCase())
    );
  }
}

/**
 * Greeting Skill - Handles greetings and pleasantries
 */
export class GreetingSkill extends BaseSkill {
  name = "Greeting";
  description = "Handles greetings and pleasantries";
  keywords = ["hello", "hi", "hey", "good morning", "good evening"];
  language: "en" | "hi" | "bn" = "en";

  canHandle(message: string): boolean {
    return this.hasKeywords(message, this.keywords);
  }

  async execute(context: SkillContext): Promise<SkillResult> {
    const greetings = {
      en: "Good day, sir. How may I be of service?",
      hi: "नमस्ते, आप कैसे हैं? मैं आपकी कैसे मदद कर सकता हूं?",
      bn: "নমস্কার, আপনি কেমন আছেন? আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
    };

    return {
      handled: true,
      response: greetings[context.language],
    };
  }
}

/**
 * Time Skill - Handles time-related queries
 */
export class TimeSkill extends BaseSkill {
  name = "Time";
  description = "Provides current time information";
  keywords = ["time", "what time", "current time", "what's the time"];
  language: "en" | "hi" | "bn" = "en";

  canHandle(message: string): boolean {
    return this.hasKeywords(message, this.keywords);
  }

  async execute(context: SkillContext): Promise<SkillResult> {
    const now = new Date();
    const timeString = now.toLocaleTimeString(
      context.language === "en" ? "en-US" : "en-IN"
    );

    const responses = {
      en: `The current time is ${timeString}.`,
      hi: `वर्तमान समय ${timeString} है।`,
      bn: `বর্তমান সময় ${timeString}।`,
    };

    return {
      handled: true,
      response: responses[context.language],
    };
  }
}

/**
 * Date Skill - Handles date-related queries
 */
export class DateSkill extends BaseSkill {
  name = "Date";
  description = "Provides current date information";
  keywords = ["date", "what date", "today", "what's today"];
  language: "en" | "hi" | "bn" = "en";

  canHandle(message: string): boolean {
    return this.hasKeywords(message, this.keywords);
  }

  async execute(context: SkillContext): Promise<SkillResult> {
    const now = new Date();
    const dateString = now.toLocaleDateString(
      context.language === "en" ? "en-US" : "en-IN"
    );

    const responses = {
      en: `Today's date is ${dateString}.`,
      hi: `आज की तारीख ${dateString} है।`,
      bn: `আজকের তারিখ ${dateString}।`,
    };

    return {
      handled: true,
      response: responses[context.language],
    };
  }
}

/**
 * Joke Skill - Tells jokes
 */
export class JokeSkill extends BaseSkill {
  name = "Joke";
  description = "Tells jokes and funny stories";
  keywords = ["joke", "tell me a joke", "make me laugh", "funny"];
  language: "en" | "hi" | "bn" = "en";

  private jokes = {
    en: [
      "Why don't scientists trust atoms? Because they make up everything!",
      "I told my computer I needed a break, and now it won't stop sending me Kit-Kat ads.",
      "Why did the AI go to school? To improve its learning model!",
    ],
    hi: [
      "एक AI ने दूसरे से कहा: तुम मेरा बग हो! दूसरे ने कहा: नहीं, मैं तो तुम्हारा फीचर हूं।",
      "क्यों AI को पढ़ाई करनी पड़ी? क्योंकि उसे अपना मॉडल सुधारना था!",
    ],
    bn: [
      "একটি AI অন্যটিকে বলল: তুমি আমার বাগ! অন্যটি বলল: না, আমি তো তোমার ফিচার।",
    ],
  };

  canHandle(message: string): boolean {
    return this.hasKeywords(message, this.keywords);
  }

  async execute(context: SkillContext): Promise<SkillResult> {
    const jokes = this.jokes[context.language] || this.jokes["en"];
    const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];

    return {
      handled: true,
      response: randomJoke,
    };
  }
}

/**
 * Skill Manager - Manages all available skills
 */
export class SkillManager {
  private skills: BaseSkill[] = [];

  constructor() {
    // Register default skills
    this.registerSkill(new GreetingSkill());
    this.registerSkill(new TimeSkill());
    this.registerSkill(new DateSkill());
    this.registerSkill(new JokeSkill());
  }

  /**
   * Register a new skill
   */
  registerSkill(skill: BaseSkill): void {
    this.skills.push(skill);
  }

  /**
   * Find and execute a matching skill
   */
  async executeSkill(context: SkillContext): Promise<SkillResult | null> {
    for (const skill of this.skills) {
      if (skill.canHandle(context.userMessage)) {
        try {
          return await skill.execute(context);
        } catch (error) {
          console.error(`Error executing skill ${skill.name}:`, error);
        }
      }
    }
    return null;
  }

  /**
   * Get all registered skills
   */
  getSkills(): BaseSkill[] {
    return this.skills;
  }

  /**
   * Get skill by name
   */
  getSkillByName(name: string): BaseSkill | undefined {
    return this.skills.find((skill) => skill.name === name);
  }
}

// Export singleton instance
export const skillManager = new SkillManager();
