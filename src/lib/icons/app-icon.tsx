import { Image, StyleProp, ImageStyle } from "react-native";
import { useColorScheme } from "nativewind";

interface AppIconProps {
  size?: number;
  className?: string;
  style?: StyleProp<ImageStyle>;
}

export function AppIcon({ size = 24, className, style }: AppIconProps) {
  const { colorScheme } = useColorScheme();

  return (
    <Image
      source={
        colorScheme === "dark"
          ? require("@/assets/images/app-icons/dark-transparent.png")
          : require("@/assets/images/app-icons/light-transparent.png")
      }
      style={[
        {
          width: size,
          height: size,
        },
        style,
      ]}
      className={className}
      resizeMode="contain"
    />
  );
}
