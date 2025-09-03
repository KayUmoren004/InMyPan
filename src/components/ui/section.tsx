"use client";

import React from "react";

import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { cn } from "@/lib/utils";
import { ChevronRight } from "@/lib/icons/chevron-right";

interface SectionProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  titleClassName?: string;
}

export function Section({
  title,
  children,
  className,
  titleClassName,
}: SectionProps) {
  const childrenArray = React.Children.toArray(children);
  const enhancedChildren = childrenArray.map((child, index) => {
    if (React.isValidElement(child) && child.type === SectionItem) {
      const isLast = index === childrenArray.length - 1;
      return React.cloneElement(child, {
        ...(child.props as SectionItemProps),
        last: isLast,
      } as SectionItemProps);
    }
    return child;
  });

  return (
    <View className={cn("flex flex-col gap-2 mb-6", className)}>
      <Text
        className={cn(
          "text-lg text-muted-foreground font-sans",
          titleClassName
        )}
      >
        {title}
      </Text>
      <View className="bg-muted/50 rounded-md">{enhancedChildren}</View>
    </View>
  );
}

interface SectionItemAction {
  type: "navigate" | "action";
  navigateTo?: string;
  action?: () => void;
}

interface SectionItemProps {
  title: string;
  icon?: React.ReactNode;
  action?: SectionItemAction;
  onPress?: () => void;
  last?: boolean;
  disabled?: boolean;
  showChevron?: boolean;
  showIcon?: boolean;
  className?: string;
  titleClassName?: string;
  iconClassName?: string;
  children?: React.ReactNode;
  leftIcon?: React.ReactNode;
}

export function SectionItem({
  title,
  icon,
  action,
  onPress,
  last = false,
  disabled = false,
  showChevron = true,
  showIcon = true,
  className,
  titleClassName,
  iconClassName,
  children,
  leftIcon,
}: SectionItemProps) {
  const { push } = useRouter();

  const handlePress = () => {
    if (disabled) return;

    // Priority: onPress > action
    if (onPress) {
      onPress();
      return;
    }

    switch (action?.type) {
      case "navigate":
        if (action.navigateTo) {
          push(action.navigateTo);
        }
        break;
      case "action":
        action.action?.();
        break;
    }
  };

  const isInteractive = !disabled && (onPress || action);

  const content = (
    <View
      className={cn(
        "flex flex-row items-center justify-between p-4",
        last && "rounded-b-md",
        !last && "border-b border-muted/50",
        disabled && "opacity-50",
        className
      )}
    >
      <View className="flex flex-row items-center gap-3 flex-1">
        {showIcon && icon && (
          <View className={cn("text-muted-foreground", iconClassName)}>
            {icon}
          </View>
        )}
        <View className="flex-1">
          <Text
            className={cn(
              "text-sm text-foreground font-medium",
              titleClassName
            )}
          >
            {title}
          </Text>
          {children}
        </View>
      </View>
      {showChevron && isInteractive && !leftIcon && (
        <ChevronRight size={20} className="text-muted-foreground ml-2" />
      )}
      {leftIcon && (
        <View className={cn("text-muted-foreground", iconClassName)}>
          {leftIcon}
        </View>
      )}
    </View>
  );

  if (isInteractive) {
    return (
      <TouchableOpacity onPress={handlePress} disabled={disabled}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}
