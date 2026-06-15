import axios from "axios";
import { BaseSkill, SkillContext, SkillResult } from "../skill-system";

/**
 * Web Search Skill - Retrieves information from the web
 * Uses Google Custom Search API or a free alternative
 */
export class WebSearchSkill extends BaseSkill {
  name = "WebSearch";
  description = "Searches the web for information";
  keywords = [
    "search",
    "find",
    "look up",
    "google",
    "what is",
    "who is",
    "when is",
    "where is",
    "how to",
  ];
  language: "en" | "hi" | "bn" = "en";

  private searchApiKey = process.env.EXPO_PUBLIC_GOOGLE_SEARCH_API_KEY || "";
  private searchEngineId =
    process.env.EXPO_PUBLIC_GOOGLE_SEARCH_ENGINE_ID || "";

  canHandle(message: string): boolean {
    return this.hasKeywords(message, this.keywords);
  }

  async execute(context: SkillContext): Promise<SkillResult> {
    try {
      // Check if API keys are configured
      if (!this.searchApiKey || !this.searchEngineId) {
        return {
          handled: false,
          requiresAI: true,
        };
      }

      // Extract search query from message
      const query = this.extractSearchQuery(context.userMessage);

      // Call Google Custom Search API
      const response = await axios.get(
        "https://www.googleapis.com/customsearch/v1",
        {
          params: {
            key: this.searchApiKey,
            cx: this.searchEngineId,
            q: query,
            num: 3, // Get top 3 results
          },
        }
      );

      if (response.data.items && response.data.items.length > 0) {
        // Format search results
        const results = response.data.items
          .slice(0, 2)
          .map(
            (item: any) =>
              `${item.title}: ${item.snippet.substring(0, 100)}...`
          )
          .join("\n");

        const responseText = this.formatResponse(
          context.language,
          query,
          results
        );

        return {
          handled: true,
          response: responseText,
        };
      } else {
        return {
          handled: true,
          response: this.getNoResultsMessage(context.language),
        };
      }
    } catch (error) {
      console.error("Error in web search:", error);
      return {
        handled: false,
        requiresAI: true,
      };
    }
  }

  private extractSearchQuery(message: string): string {
    // Remove common search keywords
    let query = message
      .toLowerCase()
      .replace(/^(search|find|look up|google|what is|who is|when is|where is|how to)\s+/i, "");

    return query.trim();
  }

  private formatResponse(
    language: "en" | "hi" | "bn",
    query: string,
    results: string
  ): string {
    const responses = {
      en: `I found the following information about "${query}":\n${results}`,
      hi: `मुझे "${query}" के बारे में निम्नलिखित जानकारी मिली:\n${results}`,
      bn: `আমি "${query}" সম্পর্কে নিম্নলিখিত তথ্য পেয়েছি:\n${results}`,
    };

    return responses[language];
  }

  private getNoResultsMessage(language: "en" | "hi" | "bn"): string {
    const messages = {
      en: "I couldn't find any results for that search. Please try a different query.",
      hi: "मुझे उस खोज के लिए कोई परिणाम नहीं मिल सके। कृपया एक अलग क्वेरी आजमाएं।",
      bn: "আমি সেই অনুসন্ধানের জন্য কোনো ফলাফল খুঁজে পাইনি। অনুগ্রহ করে একটি ভিন্ন প্রশ্ন চেষ্টা করুন।",
    };

    return messages[language];
  }
}
