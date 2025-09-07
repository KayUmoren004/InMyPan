import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useEnhancedAuth } from "@/hooks/contexts/use-enhanced-auth";
import { useMemo } from "react";
import { getFullNameFromProfile, getInitials } from "@/lib/utils";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";
import { StyleProp, ViewStyle } from "react-native";
import { UserProfile } from "../types/user-types";

type ReusableProfilePhotoProps = {
  user: UserProfile;
  className?: string;
  size?: number;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
};

export function ReusableProfilePhoto({
  user,
  className,
  style,
}: ReusableProfilePhotoProps) {
  const fullName = useMemo(() => {
    return getFullNameFromProfile(user);
  }, [user]);

  const photoUrl = useMemo(() => {
    return user?.photoURL;
  }, [user?.photoURL]);

  return (
    <Avatar
      alt="User's Avatar"
      className={cn("size-24", className)}
      style={style}
    >
      <AvatarImage source={{ uri: photoUrl as string }} />
      <AvatarFallback className={cn("size-24", className)}>
        <Text>{getInitials(fullName)}</Text>
      </AvatarFallback>
    </Avatar>
  );
}
