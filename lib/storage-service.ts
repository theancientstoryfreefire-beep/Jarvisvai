import AsyncStorage from "@react-native-async-storage/async-storage";

export interface StoredMessage {
  id: string;
  role: "user" | "jarvis";
  text: string;
  timestamp: number;
}

export interface UserProfile {
  userId: string;
  language: "en" | "hi" | "bn";
  preferences: Record<string, any>;
  createdAt: number;
  lastActive: number;
}

/**
 * StorageService handles persistent storage of conversations and user data
 * Uses AsyncStorage for React Native compatibility
 */
export class StorageService {
  private readonly MESSAGES_KEY = "jarvis_messages";
  private readonly USER_PROFILE_KEY = "jarvis_user_profile";
  private readonly PREFERENCES_KEY = "jarvis_preferences";
  private readonly SESSION_KEY = "jarvis_session";

  /**
   * Save a message to storage
   */
  async saveMessage(message: StoredMessage): Promise<void> {
    try {
      const messages = await this.getMessages();
      messages.push(message);

      // Keep only last 100 messages to avoid storage bloat
      const trimmedMessages = messages.slice(-100);

      await AsyncStorage.setItem(
        this.MESSAGES_KEY,
        JSON.stringify(trimmedMessages)
      );
    } catch (error) {
      console.error("Error saving message:", error);
    }
  }

  /**
   * Get all stored messages
   */
  async getMessages(): Promise<StoredMessage[]> {
    try {
      const data = await AsyncStorage.getItem(this.MESSAGES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error("Error retrieving messages:", error);
      return [];
    }
  }

  /**
   * Clear all messages
   */
  async clearMessages(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.MESSAGES_KEY);
    } catch (error) {
      console.error("Error clearing messages:", error);
    }
  }

  /**
   * Save user profile
   */
  async saveUserProfile(profile: UserProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.USER_PROFILE_KEY,
        JSON.stringify(profile)
      );
    } catch (error) {
      console.error("Error saving user profile:", error);
    }
  }

  /**
   * Get user profile
   */
  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const data = await AsyncStorage.getItem(this.USER_PROFILE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error retrieving user profile:", error);
      return null;
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(
    preferences: Record<string, any>
  ): Promise<void> {
    try {
      const existing = await AsyncStorage.getItem(this.PREFERENCES_KEY);
      const current = existing ? JSON.parse(existing) : {};
      const updated = { ...current, ...preferences };

      await AsyncStorage.setItem(
        this.PREFERENCES_KEY,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error("Error updating preferences:", error);
    }
  }

  /**
   * Get user preferences
   */
  async getPreferences(): Promise<Record<string, any>> {
    try {
      const data = await AsyncStorage.getItem(this.PREFERENCES_KEY);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("Error retrieving preferences:", error);
      return {};
    }
  }

  /**
   * Save session data
   */
  async saveSession(sessionData: Record<string, any>): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.SESSION_KEY,
        JSON.stringify(sessionData)
      );
    } catch (error) {
      console.error("Error saving session:", error);
    }
  }

  /**
   * Get session data
   */
  async getSession(): Promise<Record<string, any> | null> {
    try {
      const data = await AsyncStorage.getItem(this.SESSION_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("Error retrieving session:", error);
      return null;
    }
  }

  /**
   * Clear all storage
   */
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.MESSAGES_KEY,
        this.USER_PROFILE_KEY,
        this.PREFERENCES_KEY,
        this.SESSION_KEY,
      ]);
    } catch (error) {
      console.error("Error clearing all storage:", error);
    }
  }

  /**
   * Get storage statistics
   */
  async getStorageStats(): Promise<Record<string, number>> {
    try {
      const messages = await this.getMessages();
      const profile = await this.getUserProfile();
      const preferences = await this.getPreferences();

      return {
        messagesCount: messages.length,
        profileSize: profile ? JSON.stringify(profile).length : 0,
        preferencesSize: JSON.stringify(preferences).length,
      };
    } catch (error) {
      console.error("Error getting storage stats:", error);
      return {};
    }
  }
}

// Export singleton instance
export const storageService = new StorageService();
