import { useApiClient, userApi } from "@/utils/api";
import { useAuth } from "@clerk/clerk-expo";
import { useMutation } from "@tanstack/react-query";
import React, { useEffect } from "react";

export const useUserSync = () => {
  const { isSignedIn } = useAuth();
  const api = useApiClient();

  const syncUserMutation = useMutation({
    mutationFn: () => userApi.syncUser(api),
    onSuccess: (response) =>
      console.log("User synced successfully:", response.data.user),
    onError: (error) => console.error("Error syncing user:", error),
  });

  useEffect(() => {
    //if user is signed in and syncUserMutation has not been called yet
    if (isSignedIn && !syncUserMutation.data) {
      syncUserMutation.mutate();
    }
  }, [isSignedIn]);

  return null;
};

export default useUserSync;
