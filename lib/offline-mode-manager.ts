import { offlineEngine } from "./offline-engine";
import { emotionEngine, EmotionType } from "./emotion-engine";
import { advancedTTS } from "./advanced-tts-service";
import { AIOrchestrator } from "./ai-orchestrator";

export interface OfflineModeConfig {
  enableOfflineMode: boolean;
  autoSwitchOnNetworkLoss: boolean;
  cacheResponses: boolean;
  maxCacheSize: number;
}

export interface ConversationMode {
  mode: "online" | "offline";
  timestamp: number;
  isConnected: boolean;
}

/**
 * Offline Mode Manager
 * Manages switching between online and offline conversation modes
 * Provides seamless experience regardless of connectivity
 */
export class OfflineModeManager {
  private config: OfflineModeConfig = {
    enableOfflineMode: true,
    autoSwitchOnNetworkLoss: true,
    cacheResponses: true,
    maxCacheSize: 100,
  };

  private currentMode: "online" | "offline" = "online";
  private isConnected = true;
  private responseCache: Map<string, string> = new Map();
  private modeHistory: ConversationMode[] = [];

  constructor() {
    this.initializeOfflineMode();
  }

  /**
   * Initialize offline mode
   */
  private initializeOfflineMode(): void {
    // Check initial connectivity
    this.checkConnectivity();

    // Set up periodic connectivity checks
    setInterval(() => {
      this.checkConnectivity();
    }, 30000); // Check every 30 seconds
  }

  /**
   * Check network connectivity
   */
  private checkConnectivity(): void {
    // In a real app, this would check actual network status
    // For now, we'll assume connected unless explicitly set otherwise
    this.isConnected = true;

    if (
      this.config.autoSwitchOnNetworkLoss &&
      !this.isConnected &&
      this.currentMode === "online"
    ) {
      this.switchToOfflineMode();
    } else if (this.isConnected && this.currentMode === "offline") {
      this.switchToOnlineMode();
    }
  }

  /**
   * Process user input in appropriate mode
   */
  async processInput(
    userInput: string,
    orchestrator?: AIOrchestrator
  ): Promise<{
    response: string;
    emotion: string;
    mode: "online" | "offline";
  }> {
    // Analyze user emotion
    const emotionAnalysis = emotionEngine.analyzeEmotion(userInput);

    let response: string;
    let mode: "online" | "offline";

    if (this.currentMode === "offline" || !this.isConnected) {
      // Use offline engine
      const offlineResponse = await offlineEngine.processInput(userInput);
      response = offlineResponse.text;
      mode = "offline";
    } else if (orchestrator) {
      // Use online AI orchestrator
      response = await orchestrator.processUserInput(userInput);
      mode = "online";

      // Cache the response
      if (this.config.cacheResponses) {
        this.cacheResponse(userInput, response);
      }
    } else {
      // Fallback to offline
      const offlineResponse = await offlineEngine.processInput(userInput);
      response = offlineResponse.text;
      mode = "offline";
    }

    // Generate emotionally intelligent response
    const emotionalResponse = emotionEngine.generateEmotionalResponse(
      emotionAnalysis.emotion,
      response
    );

    // Record mode change
    this.recordModeUsage(mode);

    return {
      response: emotionalResponse.text,
      emotion: emotionalResponse.jarvisEmotion,
      mode,
    };
  }

  /**
   * Switch to offline mode
   */
  switchToOfflineMode(): void {
    if (this.currentMode === "offline") return;

    this.currentMode = "offline";
    console.log("Switched to offline mode");

    // Notify user
    offlineEngine.processInput("System switched to offline mode");
  }

  /**
   * Switch to online mode
   */
  switchToOnlineMode(): void {
    if (this.currentMode === "online") return;

    this.currentMode = "online";
    console.log("Switched to online mode");
  }

  /**
   * Get cached response
   */
  getCachedResponse(userInput: string): string | null {
    return this.responseCache.get(userInput.toLowerCase()) || null;
  }

  /**
   * Cache a response
   */
  private cacheResponse(userInput: string, response: string): void {
    if (this.responseCache.size >= this.config.maxCacheSize) {
      // Remove oldest entry
      const firstKey = this.responseCache.keys().next().value;
      this.responseCache.delete(firstKey);
    }

    this.responseCache.set(userInput.toLowerCase(), response);
  }

  /**
   * Record mode usage
   */
  private recordModeUsage(mode: "online" | "offline"): void {
    this.modeHistory.push({
      mode,
      timestamp: Date.now(),
      isConnected: this.isConnected,
    });

    // Keep only last 100 records
    if (this.modeHistory.length > 100) {
      this.modeHistory = this.modeHistory.slice(-100);
    }
  }

  /**
   * Get current mode
   */
  getCurrentMode(): "online" | "offline" {
    return this.currentMode;
  }

  /**
   * Get connectivity status
   */
  isOnline(): boolean {
    return this.isConnected;
  }

  /**
   * Set connectivity status (for testing)
   */
  setConnectivity(connected: boolean): void {
    this.isConnected = connected;
    this.checkConnectivity();
  }

  /**
   * Get mode statistics
   */
  getModeStatistics(): {
    onlineUsage: number;
    offlineUsage: number;
    totalUsage: number;
    onlinePercentage: number;
  } {
    const onlineCount = this.modeHistory.filter((m) => m.mode === "online")
      .length;
    const offlineCount = this.modeHistory.filter((m) => m.mode === "offline")
      .length;
    const total = this.modeHistory.length;

    return {
      onlineUsage: onlineCount,
      offlineUsage: offlineCount,
      totalUsage: total,
      onlinePercentage: total > 0 ? (onlineCount / total) * 100 : 0,
    };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.responseCache.clear();
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<OfflineModeConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Get current configuration
   */
  getConfig(): OfflineModeConfig {
    return this.config;
  }

  /**
   * Get cache statistics
   */
  getCacheStatistics(): {
    cacheSize: number;
    maxSize: number;
    hitRate: number;
  } {
    return {
      cacheSize: this.responseCache.size,
      maxSize: this.config.maxCacheSize,
      hitRate: (this.responseCache.size / this.config.maxCacheSize) * 100,
    };
  }

  /**
   * Get mode history
   */
  getModeHistory(): ConversationMode[] {
    return this.modeHistory;
  }

  /**
   * Speak response with emotion
   */
  async speakResponse(
    response: string,
    emotion: "happy" | "neutral" | "concerned" | "curious" | "professional"
  ): Promise<void> {
    const emotionMap = {
      happy: "happy" as const,
      neutral: "calm" as const,
      concerned: "sad" as const,
      curious: "excited" as const,
      professional: "professional" as const,
    };

    await advancedTTS.speak(response, {
      emotion: emotionMap[emotion],
      pauseAfter: 500,
    });
  }
}

// Export singleton instance
export const offlineModeManager = new OfflineModeManager();
