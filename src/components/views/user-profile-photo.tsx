import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEnhancedAuth } from "@/hooks/contexts/use-enhanced-auth";
import { useMemo } from "react";
import { getFullNameFromProfile, getInitials } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { StyleProp, ViewStyle } from "react-native";

type UserProfilePhotoProps = {
  className?: string;
  size?: number;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

export function UserProfilePhoto({ className, style }: UserProfilePhotoProps) {
  const { authUser } = useEnhancedAuth();

  const fullName = useMemo(() => {
    return getFullNameFromProfile(authUser);
  }, [authUser]);

  const photoUrl = useMemo(() => {
    return authUser?.photoURL;
  }, [authUser?.photoURL]);

  return (
    <Avatar
      alt="User's Avatar"
      className={cn("size-24", className)}
      style={style}
    >
      <AvatarImage source={{ uri: photoUrl }} />
      <AvatarFallback className={cn("size-24", className)}>
        <Text>{getInitials(fullName)}</Text>
      </AvatarFallback>
    </Avatar>
  );
}
