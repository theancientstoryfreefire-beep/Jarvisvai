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
import { offlineModeManager } from "@/lib/offline-mode-manager";
import { emotionEngine } from "@/lib/emotion-engine";
import { advancedTTS } from "@/lib/advanced-tts-service";
import { AIOrchestrator } from "@/lib/ai-orchestrator";
import { extendedSkillManager } from "@/lib/skill-system-extended";

const { width } = Dimensions.get("window");

interface ChatMessage {
  id: string;
  role: "user" | "jarvis";
  text: string;
  timestamp: Date;
  emotion?: string;
  mode?: "online" | "offline";
}

/**
 * Enhanced Jarvis Screen with Offline Mode and Emotional Intelligence
 */
export default function JarvisOfflineEmotionsScreen() {
  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "jarvis",
      text: "Good day, sir. I am Jarvis, your artificial intelligence assistant. I can work both online and offline. How may I be of service?",
      timestamp: new Date(),
      emotion: "professional",
      mode: "offline",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi" | "bn">("en");
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentMode, setCurrentMode] = useState<"online" | "offline">("online");
  const [userEmotion, setUserEmotion] = useState<string>("neutral");
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
   * Initialize orchestrator and offline mode
   */
  useEffect(() => {
    const initializeJarvis = async () => {
      try {
        // Create orchestrator instance
        orchestratorRef.current = new AIOrchestrator("user_001", language);

        // Configure offline mode
        offlineModeManager.updateConfig({
          enableOfflineMode: true,
          autoSwitchOnNetworkLoss: true,
          cacheResponses: true,
          maxCacheSize: 100,
        });

        // Set language for TTS
        advancedTTS.setLanguage(language);
      } catch (error) {
        console.error("Error initializing Jarvis:", error);
      }
    };

    initializeJarvis();
  }, []);

  /**
   * Update language settings
   */
  useEffect(() => {
    if (orchestratorRef.current) {
      orchestratorRef.current.setLanguage(language);
    }
    advancedTTS.setLanguage(language);
  }, [language]);

  /**
   * Auto-scroll to latest message
   */
  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  /**
   * Send message and get response
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
      // Analyze user emotion
      const emotionAnalysis = emotionEngine.analyzeEmotion(text);
      setUserEmotion(emotionAnalysis.emotion);

      // Process input through offline mode manager
      const result = await offlineModeManager.processInput(
        text,
        orchestratorRef.current
      );

      setCurrentMode(result.mode);

      // Add Jarvis message to UI
      const jarvisMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "jarvis",
        text: result.response,
        timestamp: new Date(),
        emotion: result.emotion,
        mode: result.mode,
      };

      setMessages((prev) => [...prev, jarvisMessage]);

      // Speak the response with emotion
      setIsSpeaking(true);
      await offlineModeManager.speakResponse(
        result.response,
        result.emotion
      );
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
   * Get emotion color
   */
  const getEmotionColor = (emotion: string): string => {
    const colors: Record<string, string> = {
      happy: "#00ff00",
      sad: "#0066ff",
      angry: "#ff3333",
      confused: "#ffaa00",
      excited: "#ff00ff",
      concerned: "#ff6600",
      grateful: "#00ccff",
      neutral: "#cccccc",
    };
    return colors[emotion] || "#cccccc";
  };

  /**
   * Get mode indicator
   */
  const getModeIndicator = (): string => {
    return currentMode === "online" ? "🌐 Online" : "📱 Offline";
  };

  /**
   * Show emotion statistics
   */
  const showEmotionStats = () => {
    const trend = emotionEngine.getEmotionalTrend();
    const intensity = emotionEngine.getAverageIntensity();
    const stats = offlineModeManager.getModeStatistics();

    Alert.alert(
      "Statistics",
      `Emotion Trend: ${trend}
Average Intensity: ${(intensity * 100).toFixed(0)}%
Online Usage: ${stats.onlinePercentage.toFixed(0)}%
Current Mode: ${currentMode}`
    );
  };

  /**
   * Clear conversation
   */
  const clearConversation = () => {
    Alert.alert("Clear History", "Are you sure?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Clear",
        onPress: () => {
          setMessages([
            {
              id: "welcome",
              role: "jarvis",
              text: "Good day, sir. I am Jarvis, your artificial intelligence assistant. How may I be of service?",
              timestamp: new Date(),
              emotion: "professional",
              mode: "offline",
            },
          ]);
          emotionEngine.clearHistory();
          offlineModeManager.clearCache();
        },
      },
    ]);
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
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#00ccff",
              }}
            >
              JARVIS
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
              }}
            >
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 6,
                  backgroundColor: getEmotionColor(userEmotion),
                }}
              />
              <Text
                style={{
                  fontSize: 11,
                  color: getEmotionColor(userEmotion),
                  fontWeight: "600",
                }}
              >
                {userEmotion}
              </Text>
            </View>
          </View>

          <Text
            style={{
              fontSize: 11,
              color: "#0099cc",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Offline & Emotional Intelligence v3.0
          </Text>

          {/* Mode Indicator */}
          <View
            style={{
              backgroundColor: currentMode === "online" ? "#004d00" : "#4d0000",
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 6,
              alignSelf: "center",
              marginBottom: 12,
              borderWidth: 1,
              borderColor:
                currentMode === "online" ? "#00ff00" : "#ff6666",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                color: currentMode === "online" ? "#00ff00" : "#ff9999",
                fontWeight: "600",
              }}
            >
              {getModeIndicator()}
            </Text>
          </View>

          {/* Language Selector */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 8,
              marginBottom: 12,
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
            }}
          >
            <TouchableOpacity
              onPress={clearConversation}
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
              onPress={showEmotionStats}
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
                  borderWidth: 2,
                  borderColor:
                    msg.role === "user"
                      ? "#0099ff"
                      : msg.emotion
                        ? getEmotionColor(msg.emotion)
                        : "#003d99",
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
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 6,
                    gap: 8,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 9,
                      color:
                        msg.role === "user"
                          ? "#ccccff"
                          : "#0099cc",
                    }}
                  >
                    {msg.timestamp.toLocaleTimeString()}
                  </Text>
                  {msg.emotion && msg.role === "jarvis" && (
                    <Text
                      style={{
                        fontSize: 9,
                        color: getEmotionColor(msg.emotion),
                        fontWeight: "600",
                      }}
                    >
                      {msg.emotion}
                    </Text>
                  )}
                  {msg.mode && msg.role === "jarvis" && (
                    <Text
                      style={{
                        fontSize: 9,
                        color:
                          msg.mode === "online"
                            ? "#00ff00"
                            : "#ffaa00",
                      }}
                    >
                      {msg.mode}
                    </Text>
                  )}
                </View>
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
              placeholder="Type your message..."
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
