# Jarvis AI Assistant - Enhanced Version 2.0

A sophisticated AI assistant inspired by Iron Man's Jarvis, built with React Native and Expo. This enhanced version includes advanced AI orchestration, modular skill system, and persistent storage.

## 🌟 Features

### Core Features
- 🎤 **Voice Input & Output** - Speak to Jarvis and hear responses
- 🤖 **AI Conversations** - Powered by OpenAI GPT-4o-mini
- 🌍 **Multilingual Support** - English, Hindi, and Bengali
- 🎨 **Iron Man UI** - Futuristic, dark-themed interface
- 🔊 **Voice Synthesis** - ElevenLabs integration for natural speech
- 💬 **Chat History** - Conversation tracking and management
- 💾 **Persistent Storage** - Saves conversations across sessions

### Advanced Features (Phase 3+)
- 🧠 **AI Orchestrator** - Advanced context management and multi-turn conversations
- 🛠️ **Modular Skill System** - Extensible architecture for new capabilities
- 🌐 **Web Search** - Real-time information retrieval
- 🌤️ **Weather Information** - Current conditions and forecasts
- 📰 **News Headlines** - Latest news from various categories
- 🧮 **Calculator** - Mathematical operations with natural language
- ⏰ **Reminders & Tasks** - Manage your to-do list
- 📊 **Storage Statistics** - Monitor app data usage

## 📋 Tech Stack

| Component | Technology |
|-----------|-----------|
| Frontend | React Native, Expo |
| Language | TypeScript |
| AI/LLM | OpenAI GPT-4o-mini |
| Voice Synthesis | ElevenLabs API |
| Storage | AsyncStorage |
| HTTP Client | Axios |
| Navigation | Expo Router |

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and pnpm
- Expo CLI (`npm install -g expo-cli`)
- API keys for:
  - OpenAI (required)
  - ElevenLabs (required)
  - Google Custom Search (optional)
  - OpenWeatherMap (optional)
  - NewsAPI (optional)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/theancientstoryfreefire-beep/Jarvisvai.git
cd Jarvisvai
```

2. **Install dependencies**
```bash
pnpm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. **Run the app**
```bash
# Development
pnpm dev

# Android
pnpm android

# iOS
pnpm ios
```

## 🔑 Environment Variables

Create a `.env` file with the following variables:

```bash
# Required
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key
EXPO_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_key

# Optional (for advanced skills)
EXPO_PUBLIC_GOOGLE_SEARCH_API_KEY=your_google_key
EXPO_PUBLIC_GOOGLE_SEARCH_ENGINE_ID=your_engine_id
EXPO_PUBLIC_OPENWEATHER_API_KEY=your_weather_key
EXPO_PUBLIC_NEWS_API_KEY=your_news_key
```

See `.env.example` for detailed instructions on obtaining each API key.

## 📚 Project Structure

```
jarvis-ai-enhanced/
├── app/
│   ├── _layout.tsx          # Navigation layout
│   ├── index.tsx            # Original app component
│   └── index-enhanced.tsx   # Enhanced app component (v2.0)
├── lib/
│   ├── ai-orchestrator.ts   # AI orchestration layer
│   ├── speech-service.ts    # Voice synthesis
│   ├── skill-system.ts      # Base skill system
│   ├── skill-system-extended.ts  # Extended skills
│   ├── storage-service.ts   # Data persistence
│   └── skills/
│       ├── web-search-skill.ts
│       ├── weather-skill.ts
│       ├── news-skill.ts
│       ├── calculator-skill.ts
│       └── reminder-skill.ts
├── assets/                  # Images and icons
├── .env.example            # Environment variables template
├── package.json            # Dependencies
├── PHASE_3_IMPLEMENTATION.md  # Phase 3 documentation
├── PHASE_4_IMPLEMENTATION.md  # Phase 4 documentation
└── README_ENHANCED.md      # This file
```

## 🎯 Usage

### Basic Conversation
```
User: "Hello Jarvis"
Jarvis: "Good day, sir. How may I be of service?"
```

### Using Skills

**Time & Date:**
```
User: "What time is it?"
Jarvis: "The current time is 2:30 PM."
```

**Calculator:**
```
User: "What is 50 plus 25?"
Jarvis: "The result is 75."
```

**Weather:**
```
User: "Weather in New York"
Jarvis: "The weather in New York is Cloudy with a temperature of 18°C..."
```

**Web Search:**
```
User: "Search for React Native"
Jarvis: "I found the following information about 'React Native': ..."
```

**News:**
```
User: "Latest technology news"
Jarvis: "Here are the latest news headlines: ..."
```

**Reminders:**
```
User: "Remind me to study"
Jarvis: "I've set a reminder for 'study'."

User: "Show my reminders"
Jarvis: "Here are your reminders: • Study"
```

## 🔧 Available Skills

| Skill | Keywords | Requires API |
|-------|----------|-------------|
| Greeting | hello, hi, hey | No |
| Time | time, what time | No |
| Date | date, today | No |
| Joke | joke, funny | No |
| Calculator | calculate, math, plus | No |
| Reminder | remind, task, todo | No |
| Weather | weather, temperature | Yes (OpenWeatherMap) |
| Web Search | search, find, google | Yes (Google Custom Search) |
| News | news, headlines | Yes (NewsAPI) |

## 📖 Documentation

- **[Phase 3 Implementation](PHASE_3_IMPLEMENTATION.md)** - AI Orchestrator, Speech Service, Skill System, Storage Service
- **[Phase 4 Implementation](PHASE_4_IMPLEMENTATION.md)** - Web Search, Weather, News, Calculator, Reminders

## 🛠️ Creating Custom Skills

To create a new skill:

```typescript
import { BaseSkill, SkillContext, SkillResult } from "@/lib/skill-system";

export class MySkill extends BaseSkill {
  name = "MySkill";
  description = "Does something awesome";
  keywords = ["keyword1", "keyword2"];
  language: "en" | "hi" | "bn" = "en";

  canHandle(message: string): boolean {
    return this.hasKeywords(message, this.keywords);
  }

  async execute(context: SkillContext): Promise<SkillResult> {
    return {
      handled: true,
      response: "Your response here",
    };
  }
}
```

Register it:
```typescript
import { extendedSkillManager } from "@/lib/skill-system-extended";
extendedSkillManager.registerSkill(new MySkill());
```

## 🧪 Testing

Test each feature:

```bash
# Test greeting
"Hello Jarvis"

# Test AI conversation
"Tell me about machine learning"

# Test calculator
"What is 100 divided by 4?"

# Test time
"What time is it?"

# Test with API keys configured
"Weather in London"
"Search for Python"
"Latest news"
```

## 🐛 Troubleshooting

### Issue: "API key not configured"
**Solution:** Ensure all required keys are in `.env` file

### Issue: Skill not responding
**Solution:** Check if keywords match your input (case-insensitive)

### Issue: Voice not working
**Solution:** Verify ElevenLabs API key is valid and has credits

### Issue: Storage errors
**Solution:** Ensure AsyncStorage is properly installed

## 📊 Performance Tips

1. **Cache Results:** Results are cached for 30 minutes
2. **Optimize Skills:** Skills are checked in order of frequency
3. **Limit History:** Conversation history limited to 100 messages
4. **Monitor API Usage:** Track API calls to avoid rate limits

## 🔒 Security

- Never commit `.env` file with actual keys
- Use environment variables in production
- Rotate API keys periodically
- Monitor API usage for suspicious activity
- Validate user input before processing

## 📈 Future Enhancements (Phase 5+)

- [ ] Voice input (Speech-to-Text)
- [ ] Calendar integration
- [ ] Email integration
- [ ] Smart home control
- [ ] Advanced NLP for better intent recognition
- [ ] Offline mode support
- [ ] Multi-user support
- [ ] Custom wake word detection
- [ ] Gesture controls
- [ ] AR interface

## 📝 License

MIT License - See LICENSE file for details

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues, questions, or suggestions:

1. Check the documentation
2. Review existing issues
3. Create a new issue with details
4. Include error messages and steps to reproduce

## 🙏 Credits

- Inspired by Jarvis from Marvel's Iron Man universe
- Built with React Native and Expo
- Powered by OpenAI and ElevenLabs
- Community contributions and feedback

## 📄 Version History

### v2.0 (Enhanced)
- AI Orchestrator with context management
- Modular skill system
- Web search, weather, news, calculator, reminders
- Persistent storage
- Improved UI with statistics

### v1.0 (Original)
- Basic AI conversation
- Voice synthesis with ElevenLabs
- Multilingual support (EN, HI, BN)
- Iron Man themed UI
- Chat history

---

**Last Updated:** June 2026
**Maintained by:** Manus AI
**Status:** Active Development
