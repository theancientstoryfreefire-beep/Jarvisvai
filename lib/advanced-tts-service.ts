import * as Speech from "expo-speech";
import axios from "axios";

export type EmotionExpression =
  | "happy"
  | "sad"
  | "angry"
  | "calm"
  | "excited"
  | "professional";

export interface TTSOptions {
  emotion?: EmotionExpression;
  rate?: number;
  pitch?: number;
  volume?: number;
  language?: string;
  pauseBefore?: number;
  pauseAfter?: number;
}

/**
 * Advanced Text-to-Speech Service
 * Provides emotional expression and advanced voice control
 */
export class AdvancedTTSService {
  private isPlaying = false;
  private currentLanguage: "en" | "hi" | "bn" = "en";
  private elevenlabsKey = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || "";
  private elevenlabsUrl = "https://api.elevenlabs.io/v1";
  private jarvisVoiceId = "EXAVITQu4vr4xnSDxMaL";

  /**
   * Speak text with emotional expression
   */
  async speak(text: string, options: TTSOptions = {}): Promise<void> {
    if (this.isPlaying) {
      console.warn("Audio is already playing");
      return;
    }

    try {
      this.isPlaying = true;

      // Add pause before if specified
      if (options.pauseBefore && options.pauseBefore > 0) {
        await this.delay(options.pauseBefore);
      }

      // Apply emotional modulation to text
      const modulatedText = this.applyEmotionalModulation(
        text,
        options.emotion || "professional"
      );

      // Get speech parameters based on emotion
      const speechParams = this.getEmotionalSpeechParams(
        options.emotion || "professional"
      );

      // Use native TTS with emotional parameters
      await Speech.speak(modulatedText, {
        language:
          options.language ||
          this.getLanguageCode(this.currentLanguage),
        rate: options.rate ?? speechParams.rate,
        pitch: options.pitch ?? speechParams.pitch,
        onDone: () => {
          this.isPlaying = false;
        },
        onError: () => {
          this.isPlaying = false;
        },
      });

      // Add pause after if specified
      if (options.pauseAfter && options.pauseAfter > 0) {
        await this.delay(options.pauseAfter);
      }
    } catch (error) {
      console.error("Error speaking:", error);
      this.isPlaying = false;
      throw error;
    }
  }

  /**
   * Speak with ElevenLabs for premium voice quality
   */
  async speakWithElevenLabs(
    text: string,
    options: TTSOptions = {}
  ): Promise<void> {
    if (!this.elevenlabsKey) {
      console.warn("ElevenLabs API key not configured, using native TTS");
      return this.speak(text, options);
    }

    try {
      this.isPlaying = true;

      // Apply emotional modulation
      const modulatedText = this.applyEmotionalModulation(
        text,
        options.emotion || "professional"
      );

      // Get voice settings based on emotion
      const voiceSettings = this.getElevenLabsVoiceSettings(
        options.emotion || "professional"
      );

      // Call ElevenLabs API
      const response = await axios.post(
        `${this.elevenlabsUrl}/text-to-speech/${this.jarvisVoiceId}`,
        {
          text: modulatedText,
          model_id: "eleven_multilingual_v2",
          voice_settings: voiceSettings,
        },
        {
          headers: {
            "xi-api-key": this.elevenlabsKey,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
        }
      );

      // Play audio using native player
      await this.playAudioBuffer(response.data);
      this.isPlaying = false;
    } catch (error) {
      console.error("Error with ElevenLabs TTS:", error);
      this.isPlaying = false;
      // Fallback to native TTS
      return this.speak(text, options);
    }
  }

  /**
   * Apply emotional modulation to text
   */
  private applyEmotionalModulation(
    text: string,
    emotion: EmotionExpression
  ): string {
    const modulations = {
      happy: (t: string) => `${t}! What a wonderful thought!`,
      sad: (t: string) => `${t}... I understand.`,
      angry: (t: string) => `${t}. This is unacceptable.`,
      calm: (t: string) => `${t}. Let's take a moment.`,
      excited: (t: string) => `${t}!!! This is fantastic!`,
      professional: (t: string) => `${t}.`,
    };

    return modulations[emotion](text);
  }

  /**
   * Get speech parameters based on emotion
   */
  private getEmotionalSpeechParams(emotion: EmotionExpression): {
    rate: number;
    pitch: number;
  } {
    const params = {
      happy: { rate: 1.1, pitch: 1.2 }, // Faster and higher pitch
      sad: { rate: 0.8, pitch: 0.8 }, // Slower and lower pitch
      angry: { rate: 1.2, pitch: 1.1 }, // Fast and intense
      calm: { rate: 0.9, pitch: 0.95 }, // Slow and soothing
      excited: { rate: 1.3, pitch: 1.3 }, // Very fast and high
      professional: { rate: 0.95, pitch: 1.0 }, // Standard
    };

    return params[emotion];
  }

  /**
   * Get ElevenLabs voice settings based on emotion
   */
  private getElevenLabsVoiceSettings(emotion: EmotionExpression): Record<
    string,
    number
  > {
    const settings = {
      happy: { stability: 0.4, similarity_boost: 0.8 }, // More expressive
      sad: { stability: 0.6, similarity_boost: 0.7 }, // Softer
      angry: { stability: 0.3, similarity_boost: 0.9 }, // Very expressive
      calm: { stability: 0.7, similarity_boost: 0.75 }, // Stable
      excited: { stability: 0.3, similarity_boost: 0.85 }, // Very expressive
      professional: { stability: 0.5, similarity_boost: 0.75 }, // Balanced
    };

    return settings[emotion];
  }

  /**
   * Get language code for native TTS
   */
  private getLanguageCode(language: "en" | "hi" | "bn"): string {
    const codes = {
      en: "en-US",
      hi: "hi-IN",
      bn: "bn-IN",
    };

    return codes[language];
  }

  /**
   * Play audio buffer (placeholder - would need native module)
   */
  private async playAudioBuffer(buffer: ArrayBuffer): Promise<void> {
    // This would require a native audio player module
    // For now, we'll use the native TTS as fallback
    console.log("Audio buffer received, size:", buffer.byteLength);
  }

  /**
   * Stop current speech
   */
  async stop(): Promise<void> {
    try {
      await Speech.stop();
      this.isPlaying = false;
    } catch (error) {
      console.error("Error stopping speech:", error);
    }
  }

  /**
   * Check if currently playing
   */
  isAudioPlaying(): boolean {
    return this.isPlaying;
  }

  /**
   * Set language
   */
  setLanguage(language: "en" | "hi" | "bn"): void {
    this.currentLanguage = language;
  }

  /**
   * Get current language
   */
  getLanguage(): "en" | "hi" | "bn" {
    return this.currentLanguage;
  }

  /**
   * Delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Speak with multiple emotions (advanced)
   */
  async speakWithEmotionalVariation(
    segments: Array<{ text: string; emotion: EmotionExpression }>
  ): Promise<void> {
    for (const segment of segments) {
      await this.speak(segment.text, { emotion: segment.emotion });
      await this.delay(500); // Pause between segments
    }
  }

  /**
   * Speak with emphasis on certain words
   */
  async speakWithEmphasis(
    text: string,
    emphasizedWords: string[],
    emotion: EmotionExpression = "professional"
  ): Promise<void> {
    let modifiedText = text;

    // Add emphasis markers (would be processed by TTS engine)
    for (const word of emphasizedWords) {
      const regex = new RegExp(`\\b${word}\\b`, "gi");
      modifiedText = modifiedText.replace(regex, `*${word}*`);
    }

    await this.speak(modifiedText, { emotion });
  }
}

// Export singleton instance
export const advancedTTS = new AdvancedTTSService();
