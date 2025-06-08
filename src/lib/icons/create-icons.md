# Creating Icons with iconWithClassName

This guide demonstrates how to create and set up Lucide icons with the `iconWithClassName` wrapper for use with Nativewind styling in React Native.

## Icon Creation Process

Each icon file follows this pattern:

1. Import the icon from `lucide-react-native`
2. Import the `iconWithClassName` function from the parent directory
3. Call `iconWithClassName` with the icon component
4. Export the icon as a named export

## Example Template

```tsx
import { IconName } from "lucide-react-native";
import { iconWithClassName } from "../icon-with-class-name";

iconWithClassName(IconName);
export { IconName };
```

## Usage in Components

Once created, icons can be imported and used with Nativewind's className prop:

```tsx
import { Sun } from "@/lib/icons/sun";

// Usage in a component
<Sun className="text-primary h-6 w-6" />;
```

## Common Icons Created

### Theme Icons

- `sun.tsx` - For light theme
- `moon-star.tsx` - For dark theme

### Navigation Icons

- `home.tsx` - For home navigation
- `settings.tsx` - For settings

### Action Icons

- `plus.tsx` - For adding items
- `x.tsx` - For closing/canceling

### UI Feedback Icons

- `check.tsx` - For success states
- `alert-circle.tsx` - For warnings/errors

### Form Icons

- `eye.tsx` - For password visibility
- `eye-off.tsx` - For password hiding

### Menu Icons

- `menu.tsx` - For hamburger menu
- `chevron-down.tsx` - For dropdowns

## Creating New Icons

To create a new icon:

1. Create a new file in the `src/lib/icons` directory with the name of the icon (e.g., `new-icon.tsx`)
2. Follow the template pattern above
3. Replace `IconName` with the actual icon name from Lucide
4. The icon will now be ready to use with Nativewind styling

## Important Notes

- All icons must be wrapped with `iconWithClassName` to work with Nativewind's className prop
- Icon files should be named in kebab-case (e.g., `chevron-down.tsx`)
- Icons are exported as named exports to maintain consistency
- The `iconWithClassName` wrapper enables styling via the className prop for:
  - color
  - opacity
