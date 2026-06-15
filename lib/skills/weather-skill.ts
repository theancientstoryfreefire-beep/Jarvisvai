import axios from "axios";
import { BaseSkill, SkillContext, SkillResult } from "../skill-system";

interface WeatherData {
  temperature: number;
  description: string;
  humidity: number;
  windSpeed: number;
  city: string;
}

/**
 * Weather Skill - Provides weather information
 * Uses OpenWeatherMap API
 */
export class WeatherSkill extends BaseSkill {
  name = "Weather";
  description = "Provides weather information for a location";
  keywords = [
    "weather",
    "temperature",
    "rain",
    "sunny",
    "cloudy",
    "forecast",
    "climate",
    "wind",
  ];
  language: "en" | "hi" | "bn" = "en";

  private apiKey = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || "";
  private defaultCity = "New York";

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

      // Extract city from message or use default
      const city = this.extractCity(context.userMessage) || this.defaultCity;

      // Get weather data
      const weatherData = await this.getWeatherData(city);

      if (weatherData) {
        const responseText = this.formatWeatherResponse(
          context.language,
          weatherData
        );

        return {
          handled: true,
          response: responseText,
        };
      } else {
        return {
          handled: true,
          response: this.getCityNotFoundMessage(context.language, city),
        };
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
      return {
        handled: false,
        requiresAI: true,
      };
    }
  }

  private async getWeatherData(city: string): Promise<WeatherData | null> {
    try {
      const response = await axios.get(
        "https://api.openweathermap.org/data/2.5/weather",
        {
          params: {
            q: city,
            appid: this.apiKey,
            units: "metric",
          },
        }
      );

      const data = response.data;

      return {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].main,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 3.6), // Convert m/s to km/h
        city: data.name,
      };
    } catch (error) {
      console.error("Error getting weather data:", error);
      return null;
    }
  }

  private extractCity(message: string): string | null {
    // Simple extraction - in production, use NLP
    const cityKeywords = [
      "in",
      "at",
      "for",
      "weather in",
      "temperature in",
    ];

    for (const keyword of cityKeywords) {
      const index = message.toLowerCase().indexOf(keyword);
      if (index !== -1) {
        const afterKeyword = message.substring(index + keyword.length).trim();
        // Get the first word after keyword as city
        const city = afterKeyword.split(/\s+/)[0];
        if (city) return city;
      }
    }

    return null;
  }

  private formatWeatherResponse(
    language: "en" | "hi" | "bn",
    weather: WeatherData
  ): string {
    const responses = {
      en: `The weather in ${weather.city} is ${weather.description} with a temperature of ${weather.temperature}°C. Humidity is at ${weather.humidity}% and wind speed is ${weather.windSpeed} km/h.`,
      hi: `${weather.city} में मौसम ${weather.description} है और तापमान ${weather.temperature}°C है। आर्द्रता ${weather.humidity}% है और हवा की गति ${weather.windSpeed} किमी/घंटा है।`,
      bn: `${weather.city} এ আবহাওয়া ${weather.description} এবং তাপমাত্রা ${weather.temperature}°C। আর্দ্রতা ${weather.humidity}% এবং বায়ু গতি ${weather.windSpeed} কিমি/ঘন্টা।`,
    };

    return responses[language];
  }

  private getCityNotFoundMessage(
    language: "en" | "hi" | "bn",
    city: string
  ): string {
    const messages = {
      en: `I couldn't find weather information for ${city}. Please try another city.`,
      hi: `मुझे ${city} के लिए मौसम की जानकारी नहीं मिल सकी। कृपया दूसरा शहर आजमाएं।`,
      bn: `আমি ${city} এর জন্য আবহাওয়ার তথ্য খুঁজে পাইনি। অনুগ্রহ করে অন্য শহর চেষ্টা করুন।`,
    };

    return messages[language];
  }
}
