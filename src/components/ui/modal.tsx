import type React from "react";
import {
  Modal as RNModal,
  View,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  Pressable,
} from "react-native";
import { X } from "lucide-react-native";
import { Text } from "@/components/ui/text";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  description?: string;
  showCloseButton?: boolean;
  closeOnBackdropPress?: boolean;
}

interface ModalHeaderProps {
  children: React.ReactNode;
}

interface ModalBodyProps {
  children: React.ReactNode;
}

interface ModalFooterProps {
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> & {
  Header: React.FC<ModalHeaderProps>;
  Body: React.FC<ModalBodyProps>;
  Footer: React.FC<ModalFooterProps>;
} = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  showCloseButton = true,
  closeOnBackdropPress = true,
}) => {
  return (
    <RNModal
      visible={isOpen}
      // transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        style={styles.backdrop}
        onPress={closeOnBackdropPress ? onClose : undefined}
      >
        <Pressable
          style={styles.sheetContainer}
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.sheet}>
            <View style={styles.dragIndicator} />

            {/* Header */}
            {(title || description || showCloseButton) && (
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  {title && <Text style={styles.title}>{title}</Text>}
                  {description && (
                    <Text style={styles.description}>{description}</Text>
                  )}
                </View>
                {showCloseButton && (
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={onClose}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <X size={20} color="#6B7280" />
                  </TouchableOpacity>
                )}
              </View>
            )}

            {/* Content */}
            <View style={styles.content}>{children}</View>
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
};

const ModalHeader: React.FC<ModalHeaderProps> = ({ children }) => (
  <View style={styles.customHeader}>{children}</View>
);

const ModalBody: React.FC<ModalBodyProps> = ({ children }) => (
  <View style={styles.body}>{children}</View>
);

const ModalFooter: React.FC<ModalFooterProps> = ({ children }) => (
  <View style={styles.footer}>{children}</View>
);

Modal.Header = ModalHeader;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  sheetContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: screenHeight * 0.9,
    width: screenWidth,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  sheet: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: "hidden",
  },
  dragIndicator: {
    width: 36,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  headerContent: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
  },
  closeButton: {
    padding: 4,
    borderRadius: 6,
  },
  customHeader: {
    padding: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  content: {
    flex: 1,
  },
  body: {
    flex: 1,
    padding: 20,
  },
  footer: {
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },
});

export default Modal;
