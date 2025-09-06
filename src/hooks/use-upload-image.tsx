import { useCallback } from "react";
import { useEnhancedAuth } from "./contexts/use-enhanced-auth";
import { Alert } from "react-native";
import { safeLog } from "@/lib/utils";
import { useStorage } from "./contexts/firebase/use-storage";

export const useUploadPostImage = () => {
  const { authUser } = useEnhancedAuth();
  const { uploadFile } = useStorage();

  const uid = authUser?.id;

  const uploadPostImage = useCallback(
    async (image: string) => {
      try {
        if (!uid) {
          throw new Error("No user signed in");
        }

        const fileName = `${Date.now()}-${image.split("/").pop()}`;
        const path = `users/${uid}/posts/${fileName}`;

        const url = await uploadFile(path, image);
        return url;
      } catch (error) {
        safeLog("error", "Error uploading post image");

        Alert.alert("Error", "Failed to post");
      }
    },
    [uid, uploadFile]
  );

  return { uploadPostImage };
};
