import axios from "axios";
import * as Speech from "expo-speech";

const ELEVENLABS_API_KEY = process.env.EXPO_PUBLIC_ELEVENLABS_API_KEY || "";
const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

// Professional male voice ID for Jarvis
const JARVIS_VOICE_ID = "EXAVITQu4vr4xnSDxMaL";

/**
 * SpeechService handles all voice-related operations:
 * - Text-to-Speech (TTS) for Jarvis responses
 * - Speech synthesis with ElevenLabs
 * - Voice customization and settings
 */
export class SpeechService {
  private isPlayingAudio = false;
  private currentLanguage: "en" | "hi" | "bn" = "en";

  /**
   * Synthesize text to speech using ElevenLabs API
   * Returns audio data as ArrayBuffer
   */
  async synthesizeVoice(text: string): Promise<ArrayBuffer> {
    if (!ELEVENLABS_API_KEY) {
      throw new Error("ElevenLabs API key not configured");
    }

    try {
      const response = await axios.post(
        `${ELEVENLABS_API_URL}/text-to-speech/${JARVIS_VOICE_ID}`,
        {
          text,
          model_id: "eleven_multilingual_v2", // Updated to multilingual model
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        },
        {
          headers: {
            "xi-api-key": ELEVENLABS_API_KEY,
            "Content-Type": "application/json",
          },
          responseType: "arraybuffer",
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error synthesizing voice with ElevenLabs:", error);
      throw error;
    }
  }

  /**
   * Speak text using native text-to-speech
   * Fallback when ElevenLabs is not available
   */
  async speakText(text: string): Promise<void> {
    if (this.isPlayingAudio) {
      console.warn("Audio is already playing");
      return;
    }

    try {
      this.isPlayingAudio = true;

      const languageMap = {
        en: "en-US",
        hi: "hi-IN",
        bn: "bn-IN",
      };

      await Speech.speak(text, {
        language: languageMap[this.currentLanguage],
        rate: 0.9,
        pitch: 1.0,
        onDone: () => {
          this.isPlayingAudio = false;
        },
        onError: () => {
          this.isPlayingAudio = false;
        },
      });
    } catch (error) {
      console.error("Error speaking text:", error);
      this.isPlayingAudio = false;
      throw error;
    }
  }

  /**
   * Stop current speech
   */
  async stopSpeech(): Promise<void> {
    try {
      await Speech.stop();
      this.isPlayingAudio = false;
    } catch (error) {
      console.error("Error stopping speech:", error);
    }
  }

  /**
   * Check if audio is currently playing
   */
  isAudioPlaying(): boolean {
    return this.isPlayingAudio;
  }

  /**
   * Set the current language for speech
   */
  setLanguage(language: "en" | "hi" | "bn"): void {
    this.currentLanguage = language;
  }

  /**
   * Get the current language
   */
  getLanguage(): "en" | "hi" | "bn" {
    return this.currentLanguage;
  }

  /**
   * Get available voices information
   */
  getVoiceInfo(): Record<string, any> {
    return {
      jarvisVoiceId: JARVIS_VOICE_ID,
      model: "eleven_multilingual_v2",
      voiceSettings: {
        stability: 0.5,
        similarityBoost: 0.75,
      },
    };
  }
}

// Export singleton instance
export const speechService = new SpeechService();
