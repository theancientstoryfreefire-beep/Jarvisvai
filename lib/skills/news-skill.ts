import axios from "axios";
import { BaseSkill, SkillContext, SkillResult } from "../skill-system";

interface NewsArticle {
  title: string;
  description: string;
  source: string;
  url: string;
}

/**
 * News Skill - Fetches latest news
 * Uses NewsAPI
 */
export class NewsSkill extends BaseSkill {
  name = "News";
  description = "Fetches latest news headlines";
  keywords = [
    "news",
    "headlines",
    "latest",
    "current events",
    "what's happening",
    "breaking news",
  ];
  language: "en" | "hi" | "bn" = "en";

  private apiKey = process.env.EXPO_PUBLIC_NEWS_API_KEY || "";

  canHandle(message: string): boolean {
    return this.hasKeywords(message, this.keywords);
  }

  async execute(context: SkillContext): Promise<SkillResult> {
    try {
      // Check if API key is configured
      if (!this.apiKey) {
        return {
          handled: false,
          requiresAI: true,
        };
      }

      // Extract category from message
      const category = this.extractCategory(context.userMessage);

      // Get news articles
      const articles = await this.getNews(category);

      if (articles && articles.length > 0) {
        const responseText = this.formatNewsResponse(
          context.language,
          articles
        );

        return {
          handled: true,
          response: responseText,
        };
      } else {
        return {
          handled: true,
          response: this.getNoNewsMessage(context.language),
        };
      }
    } catch (error) {
      console.error("Error fetching news:", error);
      return {
        handled: false,
        requiresAI: true,
      };
    }
  }

  private async getNews(category: string = "general"): Promise<NewsArticle[]> {
    try {
      const response = await axios.get(
        "https://newsapi.org/v2/top-headlines",
        {
          params: {
            category: category,
            apiKey: this.apiKey,
            pageSize: 3,
          },
        }
      );

      if (response.data.articles) {
        return response.data.articles.map((article: any) => ({
          title: article.title,
          description: article.description || article.content,
          source: article.source.name,
          url: article.url,
        }));
      }

      return [];
    } catch (error) {
      console.error("Error getting news:", error);
      return [];
    }
  }

  private extractCategory(message: string): string {
    const categories = [
      "business",
      "entertainment",
      "health",
      "science",
      "sports",
      "technology",
    ];

    const lowerMessage = message.toLowerCase();

    for (const category of categories) {
      if (lowerMessage.includes(category)) {
        return category;
      }
    }

    return "general";
  }

  private formatNewsResponse(
    language: "en" | "hi" | "bn",
    articles: NewsArticle[]
  ): string {
    const headlines = articles
      .slice(0, 2)
      .map((article) => `• ${article.title} (${article.source})`)
      .join("\n");

    const responses = {
      en: `Here are the latest news headlines:\n${headlines}`,
      hi: `यहाँ नवीनतम समाचार शीर्षक हैं:\n${headlines}`,
      bn: `এখানে সর্বশেষ সংবাদ শিরোনাম রয়েছে:\n${headlines}`,
    };

    return responses[language];
  }

  private getNoNewsMessage(language: "en" | "hi" | "bn"): string {
    const messages = {
      en: "I couldn't fetch news at the moment. Please try again later.",
      hi: "मैं इस समय समाचार प्राप्त नहीं कर सका। कृपया बाद में पुनः प्रयास करें।",
      bn: "আমি এই মুহূর্তে সংবাদ পেতে পারিনি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।",
    };

    return messages[language];
  }
}
