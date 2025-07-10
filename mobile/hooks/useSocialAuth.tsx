import { useSSO } from "@clerk/clerk-expo";
import { useState } from "react";
import { Alert } from "react-native";
import * as AuthSession from "expo-auth-session";
import { useRouter } from "expo-router";

export const useSocialAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { startSSOFlow } = useSSO();
  const router = useRouter();

  const handleSocialAuth = async (strategy: "oauth_google" | "oauth_apple") => {
    setIsLoading(true);
    try {
      const redirectUrl = AuthSession.makeRedirectUri({ scheme: "mobile" });
      console.log("Generated Redirect URL:", redirectUrl); 
      const { createdSessionId, setActive } = await startSSOFlow({ strategy, redirectUrl });
      if (createdSessionId && setActive) {
        await setActive({ session: createdSessionId });
        router.push("/(tabs)"); 
      }
    } catch (err) {
      console.log("Error in social auth:", JSON.stringify(err, null, 2)); 
      const provider = strategy === "oauth_google" ? "Google" : "Apple";
      Alert.alert(
        "Error",
        `Failed to sign in with ${provider}. Please check your network or contact support.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { isLoading, handleSocialAuth };
};