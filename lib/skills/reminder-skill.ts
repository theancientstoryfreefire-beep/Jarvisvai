import AsyncStorage from "@react-native-async-storage/async-storage";
import { BaseSkill, SkillContext, SkillResult } from "../skill-system";

export interface Reminder {
  id: string;
  title: string;
  description: string;
  dueDate: number;
  completed: boolean;
  createdAt: number;
}

/**
 * Reminder Skill - Manages reminders and tasks
 * Stores reminders in AsyncStorage
 */
export class ReminderSkill extends BaseSkill {
  name = "Reminder";
  description = "Manages reminders and tasks";
  keywords = [
    "remind",
    "reminder",
    "task",
    "todo",
    "remember",
    "set reminder",
    "add task",
  ];
  language: "en" | "hi" | "bn" = "en";

  private readonly REMINDERS_KEY = "jarvis_reminders";

  canHandle(message: string): boolean {
    return this.hasKeywords(message, this.keywords);
  }

  async execute(context: SkillContext): Promise<SkillResult> {
    try {
      const action = this.determineAction(context.userMessage);

      switch (action) {
        case "add":
          return await this.addReminder(context);
        case "list":
          return await this.listReminders(context);
        case "complete":
          return await this.completeReminder(context);
        default:
          return {
            handled: false,
            requiresAI: true,
          };
      }
    } catch (error) {
      console.error("Error in reminder skill:", error);
      return {
        handled: false,
        requiresAI: true,
      };
    }
  }

  private determineAction(message: string): string {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes("set") || lowerMessage.includes("add")) {
      return "add";
    } else if (
      lowerMessage.includes("list") ||
      lowerMessage.includes("show") ||
      lowerMessage.includes("my")
    ) {
      return "list";
    } else if (lowerMessage.includes("done") || lowerMessage.includes("complete")) {
      return "complete";
    }

    return "add";
  }

  private async addReminder(context: SkillContext): Promise<SkillResult> {
    try {
      // Extract reminder details from message
      const title = this.extractTitle(context.userMessage);

      if (!title) {
        return {
          handled: true,
          response: this.getAddReminderPrompt(context.language),
        };
      }

      // Create reminder
      const reminder: Reminder = {
        id: `reminder_${Date.now()}`,
        title,
        description: context.userMessage,
        dueDate: Date.now() + 24 * 60 * 60 * 1000, // Default to 24 hours
        completed: false,
        createdAt: Date.now(),
      };

      // Save reminder
      await this.saveReminder(reminder);

      const responseText = this.getAddSuccessMessage(
        context.language,
        title
      );

      return {
        handled: true,
        response: responseText,
      };
    } catch (error) {
      console.error("Error adding reminder:", error);
      return {
        handled: false,
        requiresAI: true,
      };
    }
  }

  private async listReminders(context: SkillContext): Promise<SkillResult> {
    try {
      const reminders = await this.getReminders();

      if (reminders.length === 0) {
        return {
          handled: true,
          response: this.getNoRemindersMessage(context.language),
        };
      }

      const reminderList = reminders
        .filter((r) => !r.completed)
        .slice(0, 5)
        .map((r) => `• ${r.title}`)
        .join("\n");

      const responseText = this.getRemindersListMessage(
        context.language,
        reminderList
      );

      return {
        handled: true,
        response: responseText,
      };
    } catch (error) {
      console.error("Error listing reminders:", error);
      return {
        handled: false,
        requiresAI: true,
      };
    }
  }

  private async completeReminder(context: SkillContext): Promise<SkillResult> {
    try {
      const reminders = await this.getReminders();

      if (reminders.length === 0) {
        return {
          handled: true,
          response: this.getNoRemindersMessage(context.language),
        };
      }

      // Mark the first incomplete reminder as complete
      const incompleteReminder = reminders.find((r) => !r.completed);

      if (incompleteReminder) {
        incompleteReminder.completed = true;
        await this.saveReminders(reminders);

        const responseText = this.getCompleteSuccessMessage(
          context.language,
          incompleteReminder.title
        );

        return {
          handled: true,
          response: responseText,
        };
      }

      return {
        handled: true,
        response: this.getNoRemindersMessage(context.language),
      };
    } catch (error) {
      console.error("Error completing reminder:", error);
      return {
        handled: false,
        requiresAI: true,
      };
    }
  }

  private extractTitle(message: string): string | null {
    // Simple extraction - remove common keywords
    let title = message
      .replace(/remind me to|set reminder|add task|remember to/gi, "")
      .trim();

    return title || null;
  }

  private async saveReminder(reminder: Reminder): Promise<void> {
    const reminders = await this.getReminders();
    reminders.push(reminder);
    await this.saveReminders(reminders);
  }

  private async getReminders(): Promise<Reminder[]> {
    try {
      const data = await AsyncStorage.getItem(this.REMINDERS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error getting reminders:", error);
      return [];
    }
  }

  private async saveReminders(reminders: Reminder[]): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.REMINDERS_KEY,
        JSON.stringify(reminders)
      );
    } catch (error) {
      console.error("Error saving reminders:", error);
    }
  }

  private getAddReminderPrompt(language: "en" | "hi" | "bn"): string {
    const messages = {
      en: "What would you like me to remind you about?",
      hi: "आप मुझे किस बारे में याद दिलाना चाहते हैं?",
      bn: "আপনি আমাকে কী সম্পর্কে মনে করিয়ে দিতে চান?",
    };

    return messages[language];
  }

  private getAddSuccessMessage(
    language: "en" | "hi" | "bn",
    title: string
  ): string {
    const messages = {
      en: `I've set a reminder for "${title}".`,
      hi: `मैंने "${title}" के लिए एक रिमाइंडर सेट कर दिया है।`,
      bn: `আমি "${title}" এর জন্য একটি রিমাইন্ডার সেট করেছি।`,
    };

    return messages[language];
  }

  private getCompleteSuccessMessage(
    language: "en" | "hi" | "bn",
    title: string
  ): string {
    const messages = {
      en: `Great! I've marked "${title}" as complete.`,
      hi: `बहुत अच्छा! मैंने "${title}" को पूर्ण के रूप में चिह्नित कर दिया है।`,
      bn: `দুর্দান্ত! আমি "${title}" কে সম্পূর্ণ হিসাবে চিহ্নিত করেছি।`,
    };

    return messages[language];
  }

  private getNoRemindersMessage(language: "en" | "hi" | "bn"): string {
    const messages = {
      en: "You don't have any reminders at the moment.",
      hi: "आपके पास इस समय कोई रिमाइंडर नहीं है।",
      bn: "আপনার এই মুহূর্তে কোনো রিমাইন্ডার নেই।",
    };

    return messages[language];
  }

  private getRemindersListMessage(
    language: "en" | "hi" | "bn",
    reminderList: string
  ): string {
    const messages = {
      en: `Here are your reminders:\n${reminderList}`,
      hi: `यहाँ आपके रिमाइंडर हैं:\n${reminderList}`,
      bn: `এখানে আপনার রিমাইন্ডার রয়েছে:\n${reminderList}`,
    };

    return messages[language];
  }
}
