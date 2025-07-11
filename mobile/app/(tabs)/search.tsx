import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import React from "react";
import { Feather } from "@expo/vector-icons";

const TERENDING_TOPICS = [
  { topic: "#ReactNative", tweets: "234K" },
  { topic: "#ReactVite", tweets: "1.2M" },
  { topic: "#NextJs", tweets: "400K" },
  { topic: "#TypeScript", tweets: "567K" },
  { topic: "#NodeJs", tweets: "1M" },
];

const SearchScreen = () => {
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* HEADER */}
      <View className="px-4 py-3 border-b border-gray-100">
        <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-3">
          <Feather name="search" size={20} color="#657786" />
          <TextInput
            placeholder="Search Twitter"
            className="flex-1 ml-3 text-base"
            placeholderTextColor="#657786"
          />
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={true}>
        {/* TRENDING TOPICS */}
        <View className="p-4">
          <Text className="text-xl font-bold text-gray-900 mb-4">
            Trending for you
          </Text>
          {TERENDING_TOPICS.map((item, index) => (
            <TouchableOpacity
              key={index}
              className="py-3 border-b border-gray-100"
            >
              <Text className="text-gray-500 text-sm">
                Trending in Technology
              </Text>
              <Text className="font-bold text-lg text-gray-900">
                {item.topic}
              </Text>
              <Text className="text-sm text-gray-500">
                {item.tweets} Tweets
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SearchScreen;
