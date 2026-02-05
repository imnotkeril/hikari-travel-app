const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Configure resolver to use mock for react-native-maps on web
const defaultResolver = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Use mock for react-native-maps on web platform
  if (moduleName === "react-native-maps" && platform === "web") {
    return {
      filePath: path.resolve(__dirname, "mocks/react-native-maps.js"),
      type: "sourceFile",
    };
  }
  
  // Use default resolver for other modules
  if (defaultResolver) {
    return defaultResolver(context, moduleName, platform);
  }
  
  // Fallback to standard resolution
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
