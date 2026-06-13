# Jarvis AI Assistant

A sophisticated AI assistant inspired by Iron Man's Jarvis, built with React Native and Expo.

## Features

- 🎤 **Voice Input & Output** - Speak to Jarvis and hear responses
- 🤖 **AI Conversations** - Intelligent responses powered by AI
- 🌍 **Multilingual Support** - English, Hindi, and Bengali
- 🎨 **Iron Man UI** - Futuristic, dark-themed interface
- 🔊 **Voice Synthesis** - ElevenLabs integration for natural speech
- 💬 **Chat History** - Conversation tracking and management

## Tech Stack

- **React Native** - Cross-platform mobile development
- **Expo** - Development and deployment platform
- **ElevenLabs API** - Voice synthesis with Jarvis voice
- **Google APIs** - Enhanced AI capabilities
- **TypeScript** - Type-safe development

## Installation

```bash
pnpm install
```

## Environment Variables

Create a `.env` file with:

```
EXPO_PUBLIC_ELEVENLABS_API_KEY=your_api_key
EXPO_PUBLIC_GOOGLE_API_KEY=your_api_key
```

## Running the App

### Development

```bash
pnpm dev
```

### Android

```bash
pnpm android
```

### iOS

```bash
pnpm ios
```

## Usage

1. Launch the app
2. Select your preferred language (English, Hindi, or Bengali)
3. Type or speak your command
4. Jarvis will respond with voice and text

## Features in Detail

### Multilingual Support

- **English** - Default with British accent
- **Hindi** - Native Hindi support
- **Bengali** - Native Bengali support

### Voice Synthesis

Powered by ElevenLabs, providing natural and sophisticated speech output.

### AI Responses

Intelligent responses tailored to your queries with Jarvis's characteristic wit and professionalism.

## Building APK

```bash
eas build --platform android
```

## License

MIT

## Credits

Inspired by Jarvis from Marvel's Iron Man universe.
