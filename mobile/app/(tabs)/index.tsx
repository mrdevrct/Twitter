import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import SignOutButton from "@/components/SignOutButton";
import useUserSync from "@/hooks/useUserSync";

const HomeScreen = () => {
  useUserSync(); // Ensure user sync is called
  
  return (
    <SafeAreaView className="flex-1">
      <View className="flex justify-between">
        <Text>HomeScreen</Text>
        <SignOutButton />
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
