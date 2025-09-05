import {
  View,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Pressable,
} from "react-native";
import React, { useCallback, useRef, useState } from "react";
import { Text } from "@/components/ui/text";
import { Button } from "@/components/ui/button";
import { Link, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import {
  CameraView,
  type CameraType,
  useCameraPermissions,
  CameraMode,
} from "expo-camera";
import { useIsomorphicLayoutEffect } from "@/lib/use-isomorphic-layout-effect";
import { safeLog } from "@/lib/utils";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera } from "@/lib/icons/camera";
import { Circle } from "@/lib/icons/circle";
import { CircleDot } from "@/lib/icons/circle-dot";
import { Zap } from "@/lib/icons/zap";
import { ZapOff } from "@/lib/icons/zap-off";
import { RefreshCcw } from "@/lib/icons/refresh-ccw";

const DEFAULT_LENS = "Back Camera";
const POINT_FIVE_LENS = "Back Ultra Wide Camera";
const TELEPHOTO_LENS = "Back Telephoto Camera";

export default function CaptureModal() {
  const isPresented = router.canGoBack();

  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);

  // Camera Control States
  const [facing, setFacing] = useState<CameraType>("back");
  const [enableTorch, setEnableTorch] = useState<boolean>(false);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [lenses, setLenses] = useState<string[]>([]);
  const [selectedLens, setSelectedLens] = useState<string>(DEFAULT_LENS);

  useIsomorphicLayoutEffect(() => {
    requestPermission();
  }, []);

  // When camera is ready, get active lens
  useIsomorphicLayoutEffect(() => {
    getActiveLens();
  }, [cameraRef.current]);

  const getActiveLens = async () => {
    if (cameraRef.current) {
      try {
        const lenses = await cameraRef.current.getAvailableLensesAsync();
        setLenses(lenses);
      } catch (error) {
        safeLog("error", "Error getting active lens");
      }
    }
  };

  console.log("lenses", lenses);

  if (!permission) {
    safeLog("info", "Camera permissions are still loading.");
    // Camera permissions are still loading.
    return <View />;
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  return (
    <>
      <SafeAreaView className="flex-1 items-center justify-end p-4  px-0">
        <View className="flex-1 items-center justify-center w-full">
          <View className="relative w-full h-full overflow-hidden rounded-2xl">
            <CameraView
              facing={facing}
              style={{ flex: 1, width: "100%" }}
              ref={cameraRef}
              selectedLens={selectedLens}
            />
            <View className=" w-full absolute bottom-1 px-4 py-2">
              <CameraControls
                lenses={lenses}
                facing={facing}
                mode={mode}
                selectedLens={selectedLens}
                enableTorch={enableTorch}
                setFacing={setFacing}
                setMode={setMode}
                setEnableTorch={setEnableTorch}
                setSelectedLens={setSelectedLens}
              />
            </View>
          </View>
        </View>
        <View className="h-1/4 w-full">
          <View className="flex-1 items-center justify-center">
            <View className="flex-row items-center justify-center space-x-8">
              {/* Capture button */}
              <TouchableOpacity
                className="rounded-full border-4 border-white size-[80px] bg-white items-center justify-center"
                onPress={() => {
                  // TODO: Implement capture functionality
                  safeLog("info", "Capture button pressed");
                }}
              >
                <Circle className="text-black" strokeWidth={1} size={80} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
      <StatusBar style="light" />
    </>
  );
}

type CameraControlsProps = {
  lenses: string[];
  facing: CameraType;
  mode: CameraMode;
  enableTorch: boolean;
  selectedLens: string;
  setFacing: React.Dispatch<React.SetStateAction<CameraType>>;
  setMode: React.Dispatch<React.SetStateAction<CameraMode>>;
  setEnableTorch: React.Dispatch<React.SetStateAction<boolean>>;
  setSelectedLens: React.Dispatch<React.SetStateAction<string>>;
};

const CameraControls = ({
  lenses,
  facing,
  mode,
  enableTorch,
  selectedLens,
  setFacing,
  setMode,
  setEnableTorch,
  setSelectedLens,
}: CameraControlsProps) => {
  const switchLens = useCallback(
    (currentLens: string) => {
      if (currentLens === DEFAULT_LENS) {
        setSelectedLens(POINT_FIVE_LENS);
      } else {
        setSelectedLens(DEFAULT_LENS);
      }
    },
    [lenses, setSelectedLens]
  );

  const staticLensLabelMap: Record<string, string> = {
    [POINT_FIVE_LENS]: "0.5x",
    [DEFAULT_LENS]: "1x",
  };

  return (
    <View className="flex-1 items-center justify-between w-full flex-row">
      {/* Left */}
      <View className="flex-1 items-start">
        {enableTorch ? (
          <Zap className="text-foreground" />
        ) : (
          <ZapOff className="text-foreground" />
        )}
      </View>

      {/* Center */}
      <View className="flex-1 items-center shrink-0 justify-center">
        <Pressable
          className="flex-row items-center justify-center bg-muted/30 p-2 rounded-full min-w-10 min-h-10 shrink-0 flex-1"
          onPress={() => switchLens(selectedLens)}
        >
          <Text className="text-foreground text-sm text-center">
            {staticLensLabelMap[selectedLens]}
          </Text>
        </Pressable>
      </View>

      {/* Right */}
      <View className="flex-1 items-end">
        <RefreshCcw className="text-foreground" />
      </View>
    </View>
  );
};
