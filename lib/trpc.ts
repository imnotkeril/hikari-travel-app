import { httpLink } from "@trpc/client";
import { createTRPCReact } from "@trpc/react-query";
import Constants from "expo-constants";
import superjson from "superjson";

import type { AppRouter } from "@/backend/trpc/app-router";

export const trpc = createTRPCReact<AppRouter>();

// Export getBaseUrl so it can be used in other files
export const getBaseUrl = () => {
  // Use Rork API base URL if provided
  const rorkUrl = process.env.EXPO_PUBLIC_RORK_API_BASE_URL;
  if (rorkUrl) {
    return rorkUrl;
  }

  // Fallback for local development
  // Try to get host from Expo constants
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    // hostUri format: "localhost:8081" or "192.168.1.1:8081"
    return `http://${hostUri}`;
  }

  // Default fallback for local development
  if (__DEV__) {
    return "http://localhost:8081";
  }

  // Production fallback (should not happen, but just in case)
  throw new Error(
    "EXPO_PUBLIC_RORK_API_BASE_URL is not set and could not determine base URL",
  );
};

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: `${getBaseUrl()}/api/trpc`,
      transformer: superjson,
    }),
  ],
});
