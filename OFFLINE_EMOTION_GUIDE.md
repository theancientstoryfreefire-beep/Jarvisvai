# Offline Mode & Emotional Intelligence Guide

## Overview

This guide covers the new offline conversation capabilities and emotional intelligence features added to Jarvis AI. These features enable Jarvis to provide meaningful conversations even without internet connectivity, while understanding and responding to user emotions appropriately.

## Features

### 1. Offline Conversation Engine

The offline engine provides intelligent conversations without requiring internet connection. It uses pattern matching and a comprehensive knowledge base.

**Key Features:**
- Pattern-based conversation matching
- 15+ conversation topics covered
- Contextual responses
- User profile tracking
- Conversation history management

**Supported Topics:**
- Greetings and pleasantries
- Capability inquiries
- Time and date queries
- Jokes and entertainment
- Help requests
- Emotional support
- AI/technology questions
- General conversation

**Usage:**
```typescript
import { offlineEngine } from "@/lib/offline-engine";

const response = await offlineEngine.processInput("Hello Jarvis");
console.log(response.text); // "Good day, sir. How may I be of service?"
console.log(response.emotion); // "professional"
console.log(response.confidence); // 0.95
```

### 2. Emotion Detection Engine

Detects user emotions from text input and generates emotionally intelligent responses.

**Supported Emotions:**
- **Happy** - Positive, joyful, excited
- **Sad** - Depressed, unhappy, down
- **Angry** - Frustrated, furious, upset
- **Confused** - Puzzled, uncertain, lost
- **Excited** - Thrilled, eager, anticipating
- **Concerned** - Worried, anxious, nervous
- **Grateful** - Thankful, appreciative
- **Neutral** - Default, no strong emotion

**Emotion Detection:**
```typescript
import { emotionEngine } from "@/lib/emotion-engine";

const analysis = emotionEngine.analyzeEmotion("I'm so happy today!");
console.log(analysis.emotion); // "happy"
console.log(analysis.intensity); // 0.8 (0-1 scale)
console.log(analysis.confidence); // 0.95
console.log(analysis.keywords); // ["happy"]
```

**Emotional Response Generation:**
```typescript
const emotionalResponse = emotionEngine.generateEmotionalResponse(
  "sad",
  "I understand your concerns."
);

console.log(emotionalResponse.text);
// "I'm sorry to hear that you're feeling down. Would you like to talk about it? I understand your concerns."

console.log(emotionalResponse.jarvisEmotion); // "concerned"
console.log(emotionalResponse.emotionalContext);
// "The user is experiencing sadness. Show empathy and support."
```

**Emotion Trends:**
```typescript
// Get overall emotional trend from recent conversations
const trend = emotionEngine.getEmotionalTrend();
console.log(trend); // "happy" or "sad" etc.

// Get average emotion intensity
const intensity = emotionEngine.getAverageIntensity();
console.log(intensity); // 0.65
```

### 3. Advanced Text-to-Speech Service

Provides emotional expression in voice output through modulated speech parameters.

**Emotion-Based Speech Parameters:**

| Emotion | Rate | Pitch | Stability | Similarity |
|---------|------|-------|-----------|-----------|
| Happy | 1.1x | 1.2x | 0.4 | 0.8 |
| Sad | 0.8x | 0.8x | 0.6 | 0.7 |
| Angry | 1.2x | 1.1x | 0.3 | 0.9 |
| Calm | 0.9x | 0.95x | 0.7 | 0.75 |
| Excited | 1.3x | 1.3x | 0.3 | 0.85 |
| Professional | 0.95x | 1.0x | 0.5 | 0.75 |

**Usage:**
```typescript
import { advancedTTS } from "@/lib/advanced-tts-service";

// Speak with emotion
await advancedTTS.speak("That's wonderful news!", {
  emotion: "happy",
  rate: 1.1,
  pitch: 1.2,
});

// Speak with ElevenLabs for premium quality
await advancedTTS.speakWithElevenLabs("I'm here for you.", {
  emotion: "concerned",
});

// Speak with emotional variation
await advancedTTS.speakWithEmotionalVariation([
  { text: "I'm so excited!", emotion: "excited" },
  { text: "But also nervous.", emotion: "concerned" },
  { text: "Let's do this!", emotion: "happy" },
]);

// Speak with emphasis
await advancedTTS.speakWithEmphasis(
  "This is very important",
  ["very", "important"],
  "professional"
);
```

### 4. Offline Mode Manager

Manages seamless switching between online and offline modes with automatic fallback.

**Features:**
- Automatic connectivity detection
- Seamless mode switching
- Response caching
- Mode statistics
- Conversation history tracking

**Configuration:**
```typescript
import { offlineModeManager } from "@/lib/offline-mode-manager";

// Update configuration
offlineModeManager.updateConfig({
  enableOfflineMode: true,
  autoSwitchOnNetworkLoss: true,
  cacheResponses: true,
  maxCacheSize: 100,
});

// Get current configuration
const config = offlineModeManager.getConfig();
```

**Usage:**
```typescript
// Process input (automatically uses appropriate mode)
const result = await offlineModeManager.processInput(
  "What's the weather?",
  orchestrator
);

console.log(result.response); // Response text
console.log(result.emotion); // Emotion type
console.log(result.mode); // "online" or "offline"

// Check current mode
const mode = offlineModeManager.getCurrentMode();
console.log(mode); // "online" or "offline"

// Check connectivity
const isOnline = offlineModeManager.isOnline();
console.log(isOnline); // true or false

// Get statistics
const stats = offlineModeManager.getModeStatistics();
console.log(stats);
// {
//   onlineUsage: 45,
//   offlineUsage: 5,
//   totalUsage: 50,
//   onlinePercentage: 90
// }

// Get cache statistics
const cacheStats = offlineModeManager.getCacheStatistics();
console.log(cacheStats);
// {
//   cacheSize: 25,
//   maxSize: 100,
//   hitRate: 25
// }
```

## Integration Example

Here's how to integrate all these features into your app:

```typescript
import { offlineModeManager } from "@/lib/offline-mode-manager";
import { emotionEngine } from "@/lib/emotion-engine";
import { advancedTTS } from "@/lib/advanced-tts-service";
import { AIOrchestrator } from "@/lib/ai-orchestrator";

// Initialize
const orchestrator = new AIOrchestrator("user_001", "en");

// Process user input
async function handleUserMessage(userInput: string) {
  try {
    // Get response (online or offline)
    const result = await offlineModeManager.processInput(
      userInput,
      orchestrator
    );

    // Speak response with emotion
    await offlineModeManager.speakResponse(
      result.response,
      result.emotion
    );

    // Log mode
    console.log(`Response in ${result.mode} mode`);

    return result;
  } catch (error) {
    console.error("Error processing message:", error);
  }
}

// Example usage
await handleUserMessage("I'm feeling great today!");
// Output: Speaks response with happy emotion, in online or offline mode
```

## Offline Conversation Examples

### Example 1: Greeting
```
User: "Hello Jarvis"
Jarvis: "Good day, sir. How may I be of service?"
Emotion: Professional
Mode: Offline (works without internet)
```

### Example 2: Emotional Support
```
User: "I'm feeling sad and lonely"
Jarvis: "I'm sorry to hear that you're feeling down. Would you like to talk about it? 
         I'm here for you, sir. Your well-being matters to me."
Emotion: Concerned
Mode: Offline
```

### Example 3: Entertainment
```
User: "Tell me a joke"
Jarvis: "Why don't scientists trust atoms? Because they make up everything!"
Emotion: Happy
Mode: Offline
```

### Example 4: Information
```
User: "What can you do?"
Jarvis: "I can assist with conversations, answer questions, tell jokes, manage reminders, 
         search the web, provide weather information, and much more. How may I help?"
Emotion: Curious
Mode: Offline
```

## Emotion Keywords

### Happy Keywords
happy, joyful, excited, great, wonderful, amazing, awesome, fantastic, love, brilliant, excellent, delighted, thrilled, ecstatic

### Sad Keywords
sad, depressed, unhappy, miserable, down, blue, heartbroken, devastated, disappointed, gloomy, melancholy, sorrowful

### Angry Keywords
angry, furious, mad, rage, frustrated, annoyed, irritated, livid, enraged, upset, bitter

### Confused Keywords
confused, puzzled, bewildered, lost, unclear, uncertain, don't understand, what, huh, perplexed, baffled

### Excited Keywords
excited, thrilled, pumped, stoked, psyched, eager, anticipating, looking forward, can't wait, energized

### Concerned Keywords
worried, concerned, anxious, nervous, stressed, afraid, scared, terrified, uneasy, apprehensive

### Grateful Keywords
thank you, thanks, grateful, appreciate, appreciated, thankful, obliged, indebted

## Best Practices

### 1. Emotion Detection
- Use emotion detection to understand user context
- Respond appropriately to emotional cues
- Track emotional trends over conversations

### 2. Offline Mode
- Ensure critical features work offline
- Cache frequently used responses
- Provide seamless online/offline switching

### 3. Voice Expression
- Match voice emotion to conversation context
- Use appropriate speech rate and pitch
- Add pauses for emphasis and clarity

### 4. User Experience
- Inform users about current mode
- Provide feedback on emotion detection
- Allow manual mode switching if needed

## Performance Considerations

1. **Emotion Detection:** O(n) where n is number of keywords
2. **Offline Engine:** O(m) where m is number of patterns
3. **Cache Lookup:** O(1) average case
4. **TTS Processing:** Depends on text length

## Troubleshooting

### Issue: Emotion not detected correctly
**Solution:** 
- Check if keywords are in the user input
- Verify emotion keywords list
- Consider context and sarcasm

### Issue: Offline mode not activating
**Solution:**
- Check connectivity status
- Verify `autoSwitchOnNetworkLoss` is enabled
- Check offline engine initialization

### Issue: Voice emotion not expressive enough
**Solution:**
- Use ElevenLabs API for better quality
- Adjust speech parameters manually
- Use emotional variation for complex responses

### Issue: Cache not working
**Solution:**
- Verify `cacheResponses` is enabled
- Check cache size limit
- Clear cache if needed

## Advanced Features

### Custom Emotion Responses
```typescript
// Add custom emotional response
emotionEngine.emotionalResponses.set("custom", [
  "Your custom response here",
]);
```

### Custom Offline Patterns
```typescript
// Add custom conversation pattern
offlineEngine.conversationPatterns.push({
  patterns: [/custom pattern/i],
  responses: ["Custom response"],
  emotion: "professional",
});
```

### Multi-Segment Emotional Speech
```typescript
// Speak with multiple emotions
await advancedTTS.speakWithEmotionalVariation([
  { text: "I'm happy", emotion: "happy" },
  { text: "But also concerned", emotion: "concerned" },
  { text: "Let's work together", emotion: "professional" },
]);
```

## Future Enhancements

- [ ] Sentiment analysis for more accurate emotion detection
- [ ] Machine learning-based emotion recognition
- [ ] Voice emotion synthesis with more nuanced expressions
- [ ] Multi-language emotional support
- [ ] Emotion-based conversation branching
- [ ] User emotion history and trends
- [ ] Contextual emotion awareness

## References

- [Emotion Detection in NLP](https://en.wikipedia.org/wiki/Sentiment_analysis)
- [Text-to-Speech Synthesis](https://en.wikipedia.org/wiki/Speech_synthesis)
- [Offline-First Applications](https://offlinefirst.org/)
- [ElevenLabs Documentation](https://elevenlabs.io/docs)

## License

MIT

---

**Last Updated:** June 2026
**Version:** 1.0
