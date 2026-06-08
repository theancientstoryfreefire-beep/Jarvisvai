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
} from "react-native";
import * as Speech from "expo-speech";
import { jarvisService } from "@/lib/jarvis-service";

const { width } = Dimensions.get("window");

interface ChatMessage {
  id: string;
  role: "user" | "jarvis";
  text: string;
  timestamp: Date;
}

export default function JarvisScreen() {
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
  const scrollViewRef = useRef<ScrollView>(null);

  const languageLabels = {
    en: "English",
    hi: "हिंदी",
    bn: "বাংলা",
  };

  useEffect(() => {
    jarvisService.setLanguage(language);
  }, [language]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    // Add user message
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
      // Get Jarvis response
      const response = await jarvisService.getAIResponse(text);

      // Add Jarvis message
      const jarvisMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "jarvis",
        text: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, jarvisMessage]);

      // Speak the response
      setIsSpeaking(true);
      await Speech.speak(response, {
        language:
          language === "en"
            ? "en-US"
            : language === "hi"
              ? "hi-IN"
              : "bn-IN",
        rate: 0.9,
        pitch: 1.0,
      });
      setIsSpeaking(false);
    } catch (error) {
      console.error("Error processing message:", error);
      setIsSpeaking(false);
    } finally {
      setIsProcessing(false);
    }
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
            Artificial Intelligence System
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
