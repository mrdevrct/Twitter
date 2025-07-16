import { View, Text, Alert } from "react-native";
import React, { useState } from "react";
import { commentApi, useApiClient } from "@/utils/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { set } from "date-fns";

const useComments = () => {
  const api = useApiClient();
  const [commentText, setCommentText] = useState("");
  const queryClient = useQueryClient();

  const createCommentMutation = useMutation({
    mutationFn: async ({
      postId,
      content,
    }: {
      postId: string;
      content: string;
    }) => {
      const response = await commentApi.createComment(api, postId, content);
      return response.data;
    },
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      Alert.alert("Success", "Comment created successfully");
    },
    onError: () => {
      Alert.alert("Error", "Failed to create comment");
    },
  });

  const createComment = (postId: string) => {
    if (!commentText.trim()) {
      Alert.alert("Error", "Comment cannot be empty");
      return;
    }

    createCommentMutation.mutate({ postId, content: commentText.trim() });
  };

  return {
    commentText,
    setCommentText,
    createComment,
    isCreatingComment: createCommentMutation.isPending,
  };
};

export default useComments;
