import { ClerkProvider } from "@clerk/clerk-expo";
import { tokenCache } from "@clerk/clerk-expo/token-cache";
import { Stack } from "expo-router";
import "../global.css"; // Import global styles
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";

const queryClient = new QueryClient();

/**
 * Provides the root layout for the Expo Router app, setting up authentication, data fetching, navigation, and status bar appearance.
 *
 * Wraps the application with authentication and React Query providers, configures the navigation stack, and sets the status bar style.
 */
export default function RootLayout() {
  return (
    <ClerkProvider tokenCache={tokenCache}>
      <QueryClientProvider client={queryClient}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="(tabs)" />
        </Stack>
        <StatusBar style="dark"/>
      </QueryClientProvider>
    </ClerkProvider>
  );
}
