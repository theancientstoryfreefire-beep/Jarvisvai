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
    bundleIdentifier: "com.jarvis.ai",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#000000",
    },
    package: "com.jarvis.ai",
    permissions: ["android.permission.RECORD_AUDIO"],
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/icon.png",
  },
  plugins: [
    "expo-router",
    [
      "expo-build-properties",
      {
        "android": {
          "kotlinVersion": "1.9.24"
        }
      }
    ]
  ],
};

export default config;
