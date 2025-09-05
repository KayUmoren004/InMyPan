import {
  View,
  Platform,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { cn, safeLog } from "@/lib/utils";
import { SafeAreaView } from "react-native-safe-area-context";
import { Camera } from "@/lib/icons/camera";
import { Circle } from "@/lib/icons/circle";
import { CircleDot } from "@/lib/icons/circle-dot";
import { Zap } from "@/lib/icons/zap";
import { ZapOff } from "@/lib/icons/zap-off";
import { RefreshCcw } from "@/lib/icons/refresh-ccw";
import { Maximize2 } from "@/lib/icons/maximize-2";
import { Image } from "expo-image";
import { SendHorizontal } from "@/lib/icons/send-horizontal";
import { Trash } from "@/lib/icons/trash";
import * as Location from "expo-location";
import { useUploadPostImage } from "@/hooks/use-upload-image";

// Back Cameras
const DEFAULT_BACK_LENS = "Back Camera";
const POINT_FIVE_LENS = "Back Ultra Wide Camera";
const TELEPHOTO_LENS = "Back Telephoto Camera";

// Front Cameras
const DEFAULT_FRONT_LENS = "Front Camera";
const FRONT_TRUE_DEPTH_LENS = "Front TrueDepth Camera";

type Address = {
  road: string;
  town: string;
  county: string;
  state: string;
  postcode: string;
  country: string;
};

type LocationOn = {
  street: string;
  city: string;
  country: string;
};

type ApproximateLocation = {
  city: string;
  country: string;
};

function shortenRoadName(road: string): string {
  if (!road) return "";

  const replacements: Record<string, string> = {
    Street: "St.",
    Avenue: "Ave.",
    Boulevard: "Blvd.",
    Road: "Rd.",
    Drive: "Dr.",
    Court: "Ct.",
    Lane: "Ln.",
    Terrace: "Ter.",
    Place: "Pl.",
    Square: "Sq.",
    Highway: "Hwy.",
    Parkway: "Pkwy.",
    Trail: "Trl.",
    Circle: "Cir.",
    Way: "Wy.",
  };

  let result = road;
  for (const [full, abbr] of Object.entries(replacements)) {
    const regex = new RegExp(`\\b${full}\\b`, "gi");
    result = result.replace(regex, abbr);
  }
  return result;
}

async function getAddress(lat: number, lon: number): Promise<Address> {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
  );
  const data = await response.json();

  return data.address as Address;
}

export default function CaptureModal() {
  const isPresented = router.canGoBack();
  const { uploadPostImage } = useUploadPostImage();

  const [permission, requestPermission] = useCameraPermissions();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [userLocation, setUserLocation] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cameraRef = useRef<CameraView>(null);

  // Camera Control States
  const [facing, setFacing] = useState<CameraType>("back");
  const [enableTorch, setEnableTorch] = useState<boolean>(false);
  const [mode, setMode] = useState<CameraMode>("picture");
  const [lenses, setLenses] = useState<string[]>([]);
  const [selectedLens, setSelectedLens] = useState<string>(DEFAULT_BACK_LENS);

  const [loading, setLoading] = useState<boolean>(false);

  const [uri, setUri] = useState<string | null>(null);

  useIsomorphicLayoutEffect(() => {
    requestPermission();
  }, []);

  // When camera is ready, get active lens
  useIsomorphicLayoutEffect(() => {
    getActiveLens();
  }, [cameraRef.current]);

  useEffect(() => {
    async function getCurrentLocation() {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
    }

    getCurrentLocation();
  }, []);

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

  if (!permission) {
    safeLog("info", "Camera permissions are still loading.");
    // Camera permissions are still loading.
    return <View />;
  }

  function toggleCameraFacing() {
    setFacing((current) => (current === "back" ? "front" : "back"));
  }

  const takePicture = async () => {
    setLoading(true);
    const photo = await cameraRef.current?.takePictureAsync();
    setUri(photo?.uri || null);

    // If location, get details
    if (location) {
      const address = await getAddress(
        location.coords.latitude,
        location.coords.longitude
      );
      setUserLocation(`${shortenRoadName(address.road)}`);
    }

    setLoading(false);
  };

  const renderCamera = () => {
    return (
      <>
        <View className="flex-1 items-center justify-center w-full">
          <View className="relative w-full h-full overflow-hidden rounded-2xl">
            <CameraView
              facing={facing}
              style={{ flex: 1, width: "100%" }}
              ref={cameraRef}
              selectedLens={selectedLens}
              enableTorch={enableTorch}
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
                  takePicture();
                }}
              >
                <Circle className="text-black" strokeWidth={1} size={80} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </>
    );
  };

  const renderPreview = () => {
    return (
      <>
        <View className="flex-1 items-center justify-center w-full">
          <View className="relative w-full h-full overflow-hidden rounded-2xl">
            <Image
              source={{ uri: uri || "" }}
              className="w-full h-full flex-1"
              contentFit="contain"
              style={{ width: "100%", height: "100%" }}
            />
          </View>
          <View className="w-full absolute bottom-1 px-4 py-2">
            <PreviewControls location={userLocation} errorMsg={errorMsg} />
          </View>
        </View>
        <View className="h-1/4 w-full">
          <View className="flex-1 items-center justify-center">
            <View className="flex-row items-center justify-around gap-8 w-full ">
              {/* Trash Button */}
              <TouchableOpacity
                className="flex-row items-center justify-center gap-2"
                onPress={() => {
                  setUri(null);
                }}
              >
                <Trash className="text-destructive" size={48} />
              </TouchableOpacity>

              {/* Send button */}
              <TouchableOpacity
                className="flex-row items-center justify-center gap-2"
                onPress={async () => {
                  // TODO: Implement send functionality
                  // safeLog("info", "Send button pressed");
                  const url = await uploadPostImage(uri || "");
                  console.log(url);
                }}
              >
                <SendHorizontal className="text-foreground" size={48} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </>
    );
  };

  return (
    <>
      <SafeAreaView className="flex-1 items-center justify-end p-4  px-0">
        {loading ? (
          <View className="flex-1 items-center justify-center gap-4">
            <ActivityIndicator />
            <Text className="text-foreground font-mono text-sm font-bold">
              Capturing Maximum Deliciousness
            </Text>
          </View>
        ) : uri ? (
          renderPreview()
        ) : (
          renderCamera()
        )}
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
    (currentLens: string, facing: CameraType) => {
      if (facing === "back") {
        if (currentLens === DEFAULT_BACK_LENS) {
          setSelectedLens(POINT_FIVE_LENS);
        } else {
          setSelectedLens(DEFAULT_BACK_LENS);
        }
      } else {
        if (currentLens === DEFAULT_FRONT_LENS) {
          setSelectedLens(FRONT_TRUE_DEPTH_LENS);
        } else {
          setSelectedLens(DEFAULT_FRONT_LENS);
        }
      }
    },
    [lenses, setSelectedLens]
  );

  const switchCameraFacing = useCallback(() => {
    setFacing((current) => (current === "back" ? "front" : "back"));
    setSelectedLens((current) =>
      current === DEFAULT_BACK_LENS ? DEFAULT_FRONT_LENS : DEFAULT_BACK_LENS
    );
  }, [setFacing, setSelectedLens]);

  const staticLensLabelMap: Record<string, string> = {
    [POINT_FIVE_LENS]: "0.5x",
    [DEFAULT_BACK_LENS]: "1x",
  };

  return (
    <View className="flex-1 items-center justify-between w-full flex-row h-10">
      {/* Left */}
      <View className="flex-1 items-start">
        <Pressable
          onPress={() => setEnableTorch(!enableTorch)}
          className={cn(facing === "front" && "hidden")}
        >
          {enableTorch ? (
            <Zap className="text-foreground" />
          ) : (
            <ZapOff className="text-foreground" />
          )}
        </Pressable>
      </View>

      {/* Center */}
      <View className="flex-1 items-center shrink-0 justify-center">
        <Pressable
          className={cn(
            "flex-row items-center justify-center bg-muted/30 p-2 rounded-full min-w-10 min-h-10 shrink-0 flex-1",
            facing === "front" && "hidden"
          )}
          onPress={() => switchLens(selectedLens, facing)}
        >
          {facing === "back" && (
            <Text className="text-foreground text-sm text-center">
              {staticLensLabelMap[selectedLens]}
            </Text>
          )}
          {facing === "front" && (
            <Maximize2 className="text-foreground" size={18} />
          )}
        </Pressable>
      </View>

      {/* Right */}
      <View className="flex-1 items-end">
        <Pressable onPress={switchCameraFacing}>
          <RefreshCcw className="text-foreground" />
        </Pressable>
      </View>
    </View>
  );
};

const PreviewControls = ({
  location,
  errorMsg,
}: {
  location: string | null;
  errorMsg: string | null;
}) => {
  return (
    <View className="flex-1 items-center justify-between w-full flex-row h-10">
      <View className="flex-1 items-center">
        <MutedBackground className={cn("w-32", errorMsg && "hidden")}>
          <Text
            className="font-mono text-sm font-bold"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {location}
          </Text>
        </MutedBackground>
      </View>
    </View>
  );
};

const MutedBackground = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <View
      className={cn(
        "bg-muted/80 p-2 rounded-full min-w-24 min-h-10 shrink-0 flex-1 items-center justify-center",
        className
      )}
    >
      {children}
    </View>
  );
};
