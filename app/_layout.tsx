import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { TourCreationProvider } from '@/contexts/TourCreationContext';
import { UserProvider } from '@/contexts/UserContext';
import { getBaseUrl } from '@/lib/api';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ headerBackTitle: "Back" }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
    
    // Test backend connection on startup
    if (__DEV__) {
      console.log('[App] Root layout mounted, testing backend connection...');
      
      const testConnection = async () => {
        try {
          const baseUrl = getBaseUrl();
          const healthUrl = `${baseUrl}/health`;
          console.log('[App] Testing backend connection at:', healthUrl);
          
          const response = await fetch(healthUrl, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          console.log('[App] Health check response status:', response.status);
          
          if (response.ok) {
            const data = await response.json();
            console.log('[App] Backend health check SUCCESS:', data);
          } else {
            const text = await response.text();
            console.error('[App] Backend health check FAILED:', {
              status: response.status,
              statusText: response.statusText,
              body: text,
            });
          }
        } catch (error) {
          console.error('[App] Backend connection test ERROR:', error);
          console.error('[App] Error details:', {
            message: error instanceof Error ? error.message : String(error),
            stack: error instanceof Error ? error.stack : undefined,
          });
        }
      };
      
      // Test immediately and after delay
      testConnection();
      setTimeout(testConnection, 2000);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <TourCreationProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <StatusBar style="dark" />
            <RootLayoutNav />
          </GestureHandlerRootView>
        </TourCreationProvider>
      </UserProvider>
    </QueryClientProvider>
  );
}
