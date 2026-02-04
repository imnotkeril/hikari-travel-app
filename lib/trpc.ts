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

  // For web, use window.location
  if (typeof window !== 'undefined' && window.location) {
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port || (protocol === 'https:' ? '443' : '80');
    const url = port === '80' || port === '443' 
      ? `${protocol}//${hostname}`
      : `${protocol}//${hostname}:${port}`;
    console.log('[TRPC] Using window.location:', url);
    return url;
  }

  // Fallback for local development
  // Try to get host from Expo constants
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    // hostUri format: "localhost:8081" or "192.168.1.1:8081"
    const url = `http://${hostUri}`;
    console.log('[TRPC] Using hostUri from Expo:', url);
    return url;
  }

  // Default fallback for local development
  if (__DEV__) {
    const url = "http://localhost:8081";
    console.log('[TRPC] Using default localhost:', url);
    return url;
  }

  // Production fallback (should not happen, but just in case)
  throw new Error(
    "EXPO_PUBLIC_RORK_API_BASE_URL is not set and could not determine base URL",
  );
};

const baseUrl = getBaseUrl();
const trpcUrl = `${baseUrl}/api/trpc`;

// Log URL for debugging
if (__DEV__) {
  console.log('[TRPC] Client URL:', trpcUrl);
}

export const trpcClient = trpc.createClient({
  links: [
    httpLink({
      url: trpcUrl,
      transformer: superjson,
      fetch: async (url, options) => {
        if (__DEV__) {
          console.log('[TRPC] Request:', url, options?.method);
        }
        const response = await fetch(url, options);
        if (__DEV__) {
          console.log('[TRPC] Response:', response.status, response.statusText);
        }
        if (!response.ok) {
          const text = await response.text();
          console.error('[TRPC] Error response:', text);
        }
        return response;
      },
    }),
  ],
});
