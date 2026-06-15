# Phase 4: New Skill Modules and Automation Features - Implementation Guide

## Overview

Phase 4 introduces advanced skill modules that extend Jarvis's capabilities beyond basic conversation. These skills enable web search, weather information, news retrieval, calculations, and task management.

## New Skills Implemented

### 1. Web Search Skill (`lib/skills/web-search-skill.ts`)

**Purpose:** Enables Jarvis to search the web for information using Google Custom Search API.

**Features:**
- Real-time web search
- Top 3 results retrieval
- Query extraction from natural language
- Multilingual support

**Keywords:** search, find, look up, google, what is, who is, when is, where is, how to

**Configuration:**
```bash
EXPO_PUBLIC_GOOGLE_SEARCH_API_KEY=your_api_key
EXPO_PUBLIC_GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id
```

**Usage Example:**
```
User: "Search for machine learning"
Jarvis: "I found the following information about 'machine learning': ..."
```

**Setup Instructions:**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Custom Search API
4. Create API credentials
5. Set up a Custom Search Engine at [cse.google.com](https://cse.google.com)
6. Add credentials to `.env` file

### 2. Weather Skill (`lib/skills/weather-skill.ts`)

**Purpose:** Provides real-time weather information using OpenWeatherMap API.

**Features:**
- Current temperature and conditions
- Humidity and wind speed
- City-based queries
- Multilingual responses

**Keywords:** weather, temperature, rain, sunny, cloudy, forecast, climate, wind

**Configuration:**
```bash
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_api_key
```

**Usage Example:**
```
User: "What's the weather in London?"
Jarvis: "The weather in London is Cloudy with a temperature of 15°C. Humidity is at 72% and wind speed is 12 km/h."
```

**Setup Instructions:**
1. Visit [OpenWeatherMap](https://openweathermap.org/api)
2. Sign up for a free account
3. Get your API key from the API keys section
4. Add to `.env` file

### 3. News Skill (`lib/skills/news-skill.ts`)

**Purpose:** Fetches latest news headlines using NewsAPI.

**Features:**
- Top headlines retrieval
- Category-based news (business, entertainment, health, science, sports, technology)
- Source attribution
- Multilingual support

**Keywords:** news, headlines, latest, current events, what's happening, breaking news

**Configuration:**
```bash
EXPO_PUBLIC_NEWS_API_KEY=your_api_key
```

**Usage Example:**
```
User: "Tell me the latest technology news"
Jarvis: "Here are the latest news headlines:
• New AI Model Breaks Records (TechCrunch)
• Quantum Computing Advances (Nature)"
```

**Setup Instructions:**
1. Visit [NewsAPI](https://newsapi.org)
2. Sign up for a free account
3. Get your API key
4. Add to `.env` file

### 4. Calculator Skill (`lib/skills/calculator-skill.ts`)

**Purpose:** Performs mathematical calculations with natural language support.

**Features:**
- Basic arithmetic operations (+, -, *, /)
- Text operator recognition (plus, minus, multiply, divide)
- Percentage calculations
- Safe expression evaluation

**Keywords:** calculate, math, plus, minus, multiply, divide, what is, equals

**Usage Example:**
```
User: "What is 25 plus 17?"
Jarvis: "The result is 42."

User: "Calculate 100 divided by 4"
Jarvis: "The result is 25."
```

**No API Key Required** - Works locally

### 5. Reminder Skill (`lib/skills/reminder-skill.ts`)

**Purpose:** Manages reminders and tasks with persistent storage.

**Features:**
- Add reminders
- List reminders
- Mark reminders as complete
- Persistent storage using AsyncStorage
- Automatic cleanup of completed tasks

**Keywords:** remind, reminder, task, todo, remember, set reminder, add task

**Usage Example:**
```
User: "Remind me to call mom"
Jarvis: "I've set a reminder for 'call mom'."

User: "Show my reminders"
Jarvis: "Here are your reminders:
• Call mom
• Buy groceries"

User: "Mark as done"
Jarvis: "Great! I've marked 'call mom' as complete."
```

**No API Key Required** - Uses local storage

## Extended Skill Manager

The `skill-system-extended.ts` module provides:

```typescript
import { extendedSkillManager, getAvailableSkills, getSkillHelp } from "@/lib/skill-system-extended";

// Get all available skills
const skills = getAvailableSkills();

// Get help information
const help = getSkillHelp();

// Execute a skill
const result = await extendedSkillManager.executeSkill(context);
```

## Integration Guide

### Step 1: Update Package.json

The package.json already includes AsyncStorage. No additional dependencies needed for these skills.

### Step 2: Configure Environment Variables

Update your `.env` file:

```bash
# Web Search
EXPO_PUBLIC_GOOGLE_SEARCH_API_KEY=your_google_search_api_key
EXPO_PUBLIC_GOOGLE_SEARCH_ENGINE_ID=your_google_search_engine_id

# Weather
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_openweather_api_key

# News
EXPO_PUBLIC_NEWS_API_KEY=your_newsapi_key

# Existing keys
EXPO_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

### Step 3: Update Your App Component

Replace the skill manager import:

```typescript
// Old
import { skillManager } from "@/lib/skill-system";

// New
import { extendedSkillManager } from "@/lib/skill-system-extended";

// Then use extendedSkillManager instead of skillManager
const result = await extendedSkillManager.executeSkill(context);
```

### Step 4: Test Each Skill

```bash
# Test greeting
"Hello Jarvis"

# Test time
"What time is it?"

# Test calculator
"What is 50 plus 25?"

# Test weather
"Weather in New York"

# Test news
"Latest technology news"

# Test reminders
"Remind me to study"
"Show my reminders"

# Test web search
"Search for React Native"
```

## Skill Execution Flow

```
User Input
    ↓
Extended Skill Manager
    ├─ Check Greeting Skill
    ├─ Check Time Skill
    ├─ Check Date Skill
    ├─ Check Joke Skill
    ├─ Check Web Search Skill
    ├─ Check Weather Skill
    ├─ Check News Skill
    ├─ Check Calculator Skill
    ├─ Check Reminder Skill
    │
    ├─ If any skill matches → Execute and return
    └─ If no skill matches ↓
    
AI Orchestrator (GPT-4o-mini)
    ↓
Response to User
```

## Creating Custom Skills

To create a new skill, follow this template:

```typescript
import { BaseSkill, SkillContext, SkillResult } from "../skill-system";

export class CustomSkill extends BaseSkill {
  name = "CustomSkill";
  description = "Description of what this skill does";
  keywords = ["keyword1", "keyword2", "keyword3"];
  language: "en" | "hi" | "bn" = "en";

  canHandle(message: string): boolean {
    return this.hasKeywords(message, this.keywords);
  }

  async execute(context: SkillContext): Promise<SkillResult> {
    try {
      // Implement your logic here
      const response = "Your response here";

      return {
        handled: true,
        response: response,
      };
    } catch (error) {
      console.error("Error in custom skill:", error);
      return {
        handled: false,
        requiresAI: true,
      };
    }
  }
}
```

Then register it:

```typescript
import { extendedSkillManager } from "@/lib/skill-system-extended";

extendedSkillManager.registerSkill(new CustomSkill());
```

## API Keys and Costs

| Service | Free Tier | Cost |
|---------|-----------|------|
| Google Custom Search | 100 queries/day | $5 per 1000 queries |
| OpenWeatherMap | 1000 calls/day | Free tier sufficient |
| NewsAPI | 100 requests/day | $0.50 per 1000 requests |
| OpenAI GPT-4o-mini | Pay as you go | ~$0.15 per 1M tokens |
| ElevenLabs | 10,000 characters/month | $5-99/month |

## Performance Optimization

1. **Cache Results:** Cache weather and news for 30 minutes
2. **Rate Limiting:** Implement rate limiting for API calls
3. **Skill Priority:** Order skills by frequency of use
4. **Fallback:** Always fall back to AI if skill fails

## Error Handling

Each skill includes comprehensive error handling:

```typescript
try {
  // Skill logic
} catch (error) {
  console.error("Error in skill:", error);
  return {
    handled: false,
    requiresAI: true, // Fall back to AI
  };
}
```

## Testing Checklist

- [ ] Web Search returns relevant results
- [ ] Weather shows correct temperature and conditions
- [ ] News displays latest headlines
- [ ] Calculator performs accurate calculations
- [ ] Reminders are saved and retrieved
- [ ] All skills work in all three languages
- [ ] Fallback to AI works when skill fails
- [ ] API errors are handled gracefully

## Troubleshooting

### Issue: "API key not configured"
**Solution:** Ensure all required environment variables are set in `.env` file

### Issue: Skill not triggering
**Solution:** Check if keywords match the user input (case-insensitive)

### Issue: API rate limit exceeded
**Solution:** Implement caching or upgrade to paid tier

### Issue: Multilingual responses not working
**Solution:** Verify language is being passed correctly to skill context

## Next Steps (Phase 5)

Phase 5 will focus on:
1. Enhanced UI with skill indicators
2. Visual feedback for skill execution
3. Customizable skill preferences
4. Skill usage statistics
5. Advanced filtering and sorting

## References

- [Google Custom Search API](https://developers.google.com/custom-search/v1/overview)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [NewsAPI Documentation](https://newsapi.org/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [ElevenLabs Documentation](https://elevenlabs.io/docs)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review skill-specific documentation
3. Check API provider documentation
4. Create an issue on GitHub
