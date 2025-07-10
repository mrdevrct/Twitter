import { View, Text, Button } from "react-native";
import React from "react";
import { useClerk } from "@clerk/clerk-expo";
import { SafeAreaView } from "react-native-safe-area-context";
import SignOutButton from "@/components/SignOutButton";

const HomeScreen = () => {
  const { signOut } = useClerk();
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
