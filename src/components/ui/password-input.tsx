import * as React from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";
import { cn } from "@/lib/utils";
import { Eye } from "@/lib/icons/eye";
import { EyeOff } from "@/lib/icons/eye-off";

interface PasswordInputProps extends Omit<TextInputProps, "secureTextEntry"> {
  parentClassName?: string;
}

const PasswordInput = React.forwardRef<TextInput, PasswordInputProps>(
  ({ parentClassName, className, placeholderClassName, ...props }, ref) => {
    const [isPasswordVisible, setIsPasswordVisible] = React.useState(false);

    const togglePasswordVisibility = () => {
      setIsPasswordVisible(!isPasswordVisible);
    };

    return (
      <View className={cn("relative", parentClassName)}>
        <TextInput
          ref={ref}
          className={cn(
            "web:flex h-10 native:h-12 web:w-full rounded-md border border-input bg-background px-3 web:py-2 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground placeholder:text-muted-foreground web:ring-offset-background file:border-0 file:bg-transparent file:font-medium web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2 pr-10",
            props.editable === false && "opacity-50 web:cursor-not-allowed",
            className
          )}
          placeholderClassName={cn(
            "text-muted-foreground",
            placeholderClassName
          )}
          secureTextEntry={!isPasswordVisible}
          {...props}
        />
        <Pressable
          onPress={togglePasswordVisibility}
          className="absolute right-3 top-1/2 -translate-y-1/2"
        >
          {isPasswordVisible ? (
            <EyeOff className="h-5 w-5 text-muted-foreground" />
          ) : (
            <Eye className="h-5 w-5 text-muted-foreground" />
          )}
        </Pressable>
      </View>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
