const { getDefaultConfig } = require("expo/metro-config");
const { withRorkMetro } = require("@rork-ai/toolkit-sdk/metro");

const config = getDefaultConfig(__dirname);

// withRorkMetro works both with Rork and locally
// It's just a wrapper that adds Rork-specific optimizations
module.exports = withRorkMetro(config);
