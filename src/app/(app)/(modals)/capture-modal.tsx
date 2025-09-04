import { View, Platform } from "react-native";
import React from "react";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function CaptureModal() {
  const isPresented = router.canGoBack();

  return (
    <View className="flex-1 items-center justify-center p-4">
      <Text className="text-2xl font-bold mb-4">Capture Your Meal</Text>
      <Text className="text-center text-muted-foreground mb-8">
        Take a photo of your delicious meal to share with your friends!
      </Text>

      {isPresented && (
        <Button
          onPress={() => router.back()}
          variant="outline"
          className="mt-4"
        >
          <Text>Dismiss Modal</Text>
        </Button>
      )}

      <StatusBar style={Platform.OS === "ios" ? "light" : "auto"} />
    </View>
  );
}
