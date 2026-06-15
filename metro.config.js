const { getDefaultConfig } = require("expo/metro-config");

const config = getDefaultConfig(__dirname);

// Fix for expo-router package exports issue
config.resolver = {
  ...config.resolver,
  extraNodeModules: {},
  sourceExts: ["ts", "tsx", "js", "jsx", "json", "mjs"],
};

config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config;
