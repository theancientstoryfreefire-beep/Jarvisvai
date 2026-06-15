# Phase 3: Enhanced AI Core and Voice Interaction - Implementation Guide

## Overview

This document outlines the enhancements made to the Jarvis AI Assistant in Phase 3, focusing on improved AI orchestration, voice interaction, and modular skill system.

## New Services and Modules

### 1. AI Orchestrator (`lib/ai-orchestrator.ts`)

**Purpose:** Manages the flow between STT, LLM, TTS, and skill modules with advanced context awareness.

**Key Features:**
- **Context Management:** Maintains user preferences, session information, and conversation context
- **Conversation History:** Keeps track of the last 20 messages for better context
- **Enhanced System Prompts:** Language-specific prompts with personality traits and guidelines
- **Multi-turn Reasoning:** Supports complex, multi-turn conversations with proper context
- **User Preferences:** Stores and retrieves user preferences for personalized interactions

**Usage:**
```typescript
import { AIOrchestrator } from "@/lib/ai-orchestrator";

const orchestrator = new AIOrchestrator("user_id", "en");
const response = await orchestrator.processUserInput("What's the weather?");
```

**Key Methods:**
- `processUserInput(message)` - Process user input and return AI response
- `setLanguage(language)` - Set the conversation language
- `clearHistory()` - Clear conversation history
- `getHistory()` - Get conversation history
- `updatePreferences(preferences)` - Update user preferences

### 2. Speech Service (`lib/speech-service.ts`)

**Purpose:** Handles all voice-related operations including TTS and speech synthesis.

**Key Features:**
- **ElevenLabs Integration:** Uses multilingual TTS model for high-quality voice synthesis
- **Native TTS Fallback:** Falls back to native speech API if ElevenLabs is unavailable
- **Language Support:** Supports English, Hindi, and Bengali
- **Voice Control:** Can start, stop, and check audio playback status

**Usage:**
```typescript
import { speechService } from "@/lib/speech-service";

// Speak text using native TTS
await speechService.speakText("Hello, how are you?");

// Synthesize voice with ElevenLabs (returns audio buffer)
const audioBuffer = await speechService.synthesizeVoice("Your message");
```

**Key Methods:**
- `speakText(text)` - Speak text using native TTS
- `synthesizeVoice(text)` - Synthesize text using ElevenLabs API
- `stopSpeech()` - Stop current speech
- `isAudioPlaying()` - Check if audio is playing
- `setLanguage(language)` - Set language for speech

### 3. Skill System (`lib/skill-system.ts`)

**Purpose:** Provides a modular architecture for adding new capabilities to Jarvis.

**Key Features:**
- **Base Skill Class:** Abstract class for creating new skills
- **Skill Manager:** Manages registration and execution of skills
- **Built-in Skills:** Greeting, Time, Date, and Joke skills included
- **Extensible Architecture:** Easy to add new skills by extending BaseSkill

**Built-in Skills:**
1. **GreetingSkill** - Handles greetings and pleasantries
2. **TimeSkill** - Provides current time
3. **DateSkill** - Provides current date
4. **JokeSkill** - Tells jokes

**Creating a New Skill:**
```typescript
import { BaseSkill, SkillContext, SkillResult } from "@/lib/skill-system";

export class WeatherSkill extends BaseSkill {
  name = "Weather";
  description = "Provides weather information";
  keywords = ["weather", "temperature", "rain"];
  language = "en";

  canHandle(message: string): boolean {
    return this.hasKeywords(message, this.keywords);
  }

  async execute(context: SkillContext): Promise<SkillResult> {
    // Implement weather logic here
    return {
      handled: true,
      response: "The weather is sunny and warm.",
    };
  }
}

// Register the skill
skillManager.registerSkill(new WeatherSkill());
```

**Usage:**
```typescript
import { skillManager } from "@/lib/skill-system";

const result = await skillManager.executeSkill({
  userId: "user_001",
  language: "en",
  userMessage: "What time is it?",
  conversationHistory: [],
});

if (result && result.handled) {
  console.log(result.response);
}
```

### 4. Storage Service (`lib/storage-service.ts`)

**Purpose:** Handles persistent storage of conversations and user data using AsyncStorage.

**Key Features:**
- **Message Storage:** Saves and retrieves conversation messages (last 100 messages)
- **User Profile:** Stores user information and preferences
- **Session Management:** Maintains session data across app restarts
- **Storage Statistics:** Provides information about storage usage

**Usage:**
```typescript
import { storageService, StoredMessage } from "@/lib/storage-service";

// Save a message
await storageService.saveMessage({
  id: "msg_1",
  role: "user",
  text: "Hello Jarvis",
  timestamp: Date.now(),
});

// Get all messages
const messages = await storageService.getMessages();

// Save user profile
await storageService.saveUserProfile({
  userId: "user_001",
  language: "en",
  preferences: { theme: "dark" },
  createdAt: Date.now(),
  lastActive: Date.now(),
});

// Get storage statistics
const stats = await storageService.getStorageStats();
```

**Key Methods:**
- `saveMessage(message)` - Save a message to storage
- `getMessages()` - Get all stored messages
- `clearMessages()` - Clear all messages
- `saveUserProfile(profile)` - Save user profile
- `getUserProfile()` - Get user profile
- `updatePreferences(preferences)` - Update user preferences
- `getPreferences()` - Get user preferences
- `clearAll()` - Clear all storage
- `getStorageStats()` - Get storage statistics

## Enhanced UI Component (`app/index-enhanced.tsx`)

**Key Improvements:**
- **AI Orchestrator Integration:** Uses new AIOrchestrator for better responses
- **Skill System Integration:** Attempts to handle queries with skills before falling back to AI
- **Persistent Storage:** Loads and saves messages automatically
- **Storage Statistics:** Shows storage usage information
- **Improved UI:** Better visual feedback and status indicators
- **Language Persistence:** Remembers user's language preference

**New Features:**
- Clear History button with confirmation
- Storage Statistics display
- Timestamp display for messages
- Better error handling with alerts

## Installation and Setup

### 1. Install Dependencies

```bash
cd jarvis-ai-enhanced
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file with:
```
EXPO_PUBLIC_ELEVENLABS_API_KEY=your_elevenlabs_api_key
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

### 3. Run the Enhanced App

```bash
# Development
pnpm dev

# Android
pnpm android

# iOS
pnpm ios
```

## Integration Steps

To integrate the enhanced version into your existing app:

1. **Copy new service files** to `lib/` directory:
   - `ai-orchestrator.ts`
   - `speech-service.ts`
   - `skill-system.ts`
   - `storage-service.ts`

2. **Update package.json** with new dependencies:
   ```bash
   pnpm add @react-native-async-storage/async-storage
   ```

3. **Replace or update the main app component**:
   - Option A: Replace `app/index.tsx` with `app/index-enhanced.tsx`
   - Option B: Gradually integrate features from the enhanced version

4. **Update environment variables** with your API keys

## Next Steps (Phase 4)

The following enhancements are planned for Phase 4:

1. **Web Search Integration** - Add capability to search the web
2. **Calendar Integration** - Connect with calendar APIs
3. **System Control** - Execute system commands
4. **Weather API** - Get real-time weather information
5. **News Fetching** - Retrieve latest news
6. **Custom Skill Development** - Guide for creating domain-specific skills

## Testing Recommendations

1. **Test AI Responses:**
   - Verify GPT-4o responses are more coherent
   - Test multi-turn conversations
   - Verify context is maintained

2. **Test Skills:**
   - Test greeting skill
   - Test time and date skills
   - Test joke skill
   - Verify skill fallback to AI works

3. **Test Storage:**
   - Verify messages are saved
   - Test app restart and message persistence
   - Check storage statistics

4. **Test Multilingual Support:**
   - Test all three languages
   - Verify language switching works
   - Test TTS in all languages

## Troubleshooting

### Issue: API Key Errors
**Solution:** Ensure environment variables are properly set in `.env` file

### Issue: Storage Not Working
**Solution:** Ensure AsyncStorage is properly installed and linked

### Issue: Speech Not Working
**Solution:** Check that ElevenLabs API key is valid and has sufficient credits

### Issue: Skills Not Triggering
**Solution:** Verify keywords match user input (case-insensitive matching is used)

## Architecture Diagram

```
User Input
    ↓
Skill Manager (Check if skill can handle)
    ├─ If handled → Return skill response
    └─ If not handled ↓
    
AI Orchestrator
    ├─ Add to conversation history
    ├─ Build system prompt with context
    ├─ Call OpenAI GPT-4o-mini
    └─ Return response
    
    ↓
Speech Service
    ├─ Try ElevenLabs TTS
    └─ Fallback to native TTS
    
    ↓
Storage Service (Save message)
    
    ↓
Display to User
```

## Performance Considerations

1. **API Calls:** Minimize API calls by using skills for common queries
2. **Storage:** Limit history to 100 messages to prevent storage bloat
3. **Context:** Keep conversation context to last 20 messages for faster processing
4. **Caching:** Consider caching common responses

## Security Considerations

1. **API Keys:** Never commit `.env` file to version control
2. **User Data:** Ensure user data is encrypted if stored locally
3. **API Limits:** Implement rate limiting for API calls
4. **Input Validation:** Validate user input before processing

## Contributing

To add new skills or features:

1. Create a new skill class extending `BaseSkill`
2. Implement `canHandle()` and `execute()` methods
3. Register with `skillManager.registerSkill()`
4. Test thoroughly before deployment

## License

MIT
