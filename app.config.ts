import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "Jarvis AI",
  slug: "jarvis-ai",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",

  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#000000",
    },
  },
  web: {
    bundler: "metro",
    output: "static",
  },
  plugins: [
    "expo-router",
    ["expo-audio", { microphonePermission: "Allow Jarvis to listen" }],
    ["expo-speech", {}],
  ],
};

export default config;
