import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  Alert,
} from "react-native";
import * as Speech from "expo-speech";
import { AIOrchestrator } from "@/lib/ai-orchestrator";
import { speechService } from "@/lib/speech-service";
import { skillManager } from "@/lib/skill-system";
import { storageService, StoredMessage } from "@/lib/storage-service";

const { width } = Dimensions.get("window");

interface ChatMessage {
  id: string;
  role: "user" | "jarvis";
  text: string;
  timestamp: Date;
}

/**
 * Enhanced Jarvis Screen with improved AI orchestration,
 * skill system, and persistent storage
 */
export default function JarvisScreenEnhanced() {
  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "jarvis",
      text: "Good day, sir. I am Jarvis, your artificial intelligence assistant. How may I be of service?",
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi" | "bn">("en");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showStats, setShowStats] = useState(false);

  // References
  const scrollViewRef = useRef<ScrollView>(null);
  const orchestratorRef = useRef<AIOrchestrator | null>(null);

  // Language labels
  const languageLabels = {
    en: "English",
    hi: "हिंदी",
    bn: "বাংলা",
  };

  /**
   * Initialize orchestrator and load previous messages
   */
  useEffect(() => {
    const initializeJarvis = async () => {
      try {
        // Create orchestrator instance
        orchestratorRef.current = new AIOrchestrator("user_001", language);

        // Load previous messages from storage
        const storedMessages = await storageService.getMessages();
        if (storedMessages.length > 0) {
          const loadedMessages: ChatMessage[] = storedMessages.map((msg) => ({
            id: msg.id,
            role: msg.role,
            text: msg.text,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages((prev) => [...prev, ...loadedMessages]);
        }

        // Load user preferences
        const preferences = await storageService.getPreferences();
        if (preferences.language) {
          setLanguage(preferences.language);
        }
      } catch (error) {
        console.error("Error initializing Jarvis:", error);
      }
    };

    initializeJarvis();
  }, []);

  /**
   * Update orchestrator and speech service when language changes
   */
  useEffect(() => {
    if (orchestratorRef.current) {
      orchestratorRef.current.setLanguage(language);
    }
    speechService.setLanguage(language);
    storageService.updatePreferences({ language });
  }, [language]);

  /**
   * Auto-scroll to latest message
   */
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  /**
   * Send message and get response from Jarvis
   */
  const sendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    // Add user message to UI
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsProcessing(true);

    try {
      // Save user message to storage
      await storageService.saveMessage({
        id: userMessage.id,
        role: "user",
        text,
        timestamp: userMessage.timestamp.getTime(),
      });

      // Try to handle with skill system first
      let response: string | null = null;
      const skillResult = await skillManager.executeSkill({
        userId: "user_001",
        language,
        userMessage: text,
        conversationHistory: messages,
      });

      if (skillResult && skillResult.handled) {
        response = skillResult.response || "";
      } else {
        // Fall back to AI orchestrator
        if (orchestratorRef.current) {
          response = await orchestratorRef.current.processUserInput(text);
        }
      }

      if (!response) {
        response =
          "I apologize, but I encountered an error processing your request.";
      }

      // Add Jarvis message to UI
      const jarvisMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "jarvis",
        text: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, jarvisMessage]);

      // Save Jarvis message to storage
      await storageService.saveMessage({
        id: jarvisMessage.id,
        role: "jarvis",
        text: response,
        timestamp: jarvisMessage.timestamp.getTime(),
      });

      // Speak the response
      setIsSpeaking(true);
      await speechService.speakText(response);
      setIsSpeaking(false);
    } catch (error) {
      console.error("Error processing message:", error);
      setIsSpeaking(false);
      Alert.alert("Error", "Failed to process your message. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Clear conversation history
   */
  const clearHistory = async () => {
    Alert.alert("Clear History", "Are you sure you want to clear all messages?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Clear",
        onPress: async () => {
          await storageService.clearMessages();
          setMessages([
            {
              id: "welcome",
              role: "jarvis",
              text: "Good day, sir. I am Jarvis, your artificial intelligence assistant. How may I be of service?",
              timestamp: new Date(),
            },
          ]);
          if (orchestratorRef.current) {
            orchestratorRef.current.clearHistory();
          }
        },
      },
    ]);
  };

  /**
   * Show storage statistics
   */
  const showStorageStats = async () => {
    const stats = await storageService.getStorageStats();
    Alert.alert(
      "Storage Statistics",
      `Messages: ${stats.messagesCount}\nProfile Size: ${stats.profileSize} bytes\nPreferences Size: ${stats.preferencesSize} bytes`
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#000" }}>
      <View style={{ flex: 1, backgroundColor: "#000" }}>
        {/* Header */}
        <View
          style={{
            backgroundColor: "#001a4d",
            paddingVertical: 16,
            paddingHorizontal: 16,
            borderBottomWidth: 1,
            borderBottomColor: "#003d99",
          }}
        >
          <Text
            style={{
              fontSize: 28,
              fontWeight: "bold",
              color: "#00ccff",
              textAlign: "center",
            }}
          >
            JARVIS
          </Text>
          <Text
            style={{
              fontSize: 11,
              color: "#0099cc",
              textAlign: "center",
              marginTop: 4,
            }}
          >
            Enhanced AI System v2.0
          </Text>

          {/* Language Selector */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
              marginTop: 12,
            }}
          >
            {(["en", "hi", "bn"] as const).map((lang) => (
              <TouchableOpacity
                key={lang}
                onPress={() => setLanguage(lang)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 6,
                  backgroundColor:
                    language === lang ? "#0066cc" : "#1a1a2e",
                  borderWidth: 1,
                  borderColor:
                    language === lang ? "#00ccff" : "#333",
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    color: language === lang ? "#fff" : "#666",
                    fontWeight: "600",
                  }}
                >
                  {languageLabels[lang]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Action Buttons */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
              marginTop: 12,
            }}
          >
            <TouchableOpacity
              onPress={clearHistory}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 6,
                backgroundColor: "#4d0000",
                borderWidth: 1,
                borderColor: "#ff3333",
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: "#ff6666",
                  fontWeight: "600",
                }}
              >
                Clear
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={showStorageStats}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 6,
                borderRadius: 6,
                backgroundColor: "#004d4d",
                borderWidth: 1,
                borderColor: "#00cccc",
              }}
            >
              <Text
                style={{
                  fontSize: 10,
                  color: "#00ffff",
                  fontWeight: "600",
                }}
              >
                Stats
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Chat Area */}
        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1, paddingHorizontal: 12, paddingVertical: 12 }}
          contentContainerStyle={{ paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={{
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                marginBottom: 12,
                alignItems: "flex-end",
              }}
            >
              <View
                style={{
                  maxWidth: "80%",
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  backgroundColor:
                    msg.role === "user" ? "#0066cc" : "#1a1a2e",
                  borderWidth: 1,
                  borderColor:
                    msg.role === "user" ? "#0099ff" : "#003d99",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    color: msg.role === "user" ? "#fff" : "#00ccff",
                    lineHeight: 20,
                  }}
                >
                  {msg.text}
                </Text>
                <Text
                  style={{
                    fontSize: 9,
                    color:
                      msg.role === "user" ? "#ccccff" : "#0099cc",
                    marginTop: 4,
                  }}
                >
                  {msg.timestamp.toLocaleTimeString()}
                </Text>
              </View>
            </View>
          ))}
          {isProcessing && (
            <View
              style={{
                flexDirection: "row",
                marginBottom: 12,
                alignItems: "center",
              }}
            >
              <View
                style={{
                  backgroundColor: "#1a1a2e",
                  borderRadius: 12,
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: "#003d99",
                }}
              >
                <ActivityIndicator size="small" color="#00ccff" />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View
          style={{
            backgroundColor: "#0a0a14",
            paddingHorizontal: 12,
            paddingVertical: 12,
            borderTopWidth: 1,
            borderTopColor: "#003d99",
          }}
        >
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
            <TextInput
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your command..."
              placeholderTextColor="#444"
              style={{
                flex: 1,
                backgroundColor: "#1a1a2e",
                color: "#fff",
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 14,
                borderWidth: 1,
                borderColor: "#003d99",
              }}
              editable={!isProcessing}
            />
            <TouchableOpacity
              onPress={() => sendMessage(inputText)}
              disabled={isProcessing || !inputText.trim()}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderRadius: 8,
                backgroundColor:
                  isProcessing || !inputText.trim()
                    ? "#1a1a2e"
                    : "#0066cc",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color:
                    isProcessing || !inputText.trim()
                      ? "#666"
                      : "#fff",
                  fontWeight: "bold",
                  fontSize: 12,
                }}
              >
                Send
              </Text>
            </TouchableOpacity>
          </View>

          {/* Status Indicator */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              paddingVertical: 8,
            }}
          >
            {isSpeaking && (
              <>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#00ff00",
                  }}
                />
                <Text style={{ color: "#00ff00", fontSize: 12 }}>
                  Speaking...
                </Text>
              </>
            )}
            {isProcessing && (
              <>
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "#ffaa00",
                  }}
                />
                <Text style={{ color: "#ffaa00", fontSize: 12 }}>
                  Processing...
                </Text>
              </>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}
