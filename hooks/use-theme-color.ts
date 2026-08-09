/**
 * Learn more about light and dark modes:
 * https://docs.expo.dev/guides/color-schemes/
 */

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const theme = useColorScheme();
  const resolvedTheme: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';
  const colorFromProps = props[resolvedTheme];

  if (colorFromProps) {
    return colorFromProps;
  }

  return Colors[resolvedTheme][colorName];
}
