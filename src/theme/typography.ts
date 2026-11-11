import { TextStyle } from 'react-native';

// Font names must match the keys loaded in src/app/_layout.tsx
export const fonts = {
  heading: 'BricolageGrotesque_700Bold',
  headingMedium: 'BricolageGrotesque_500Medium',
  regular: 'Inter_400Regular',
  medium: 'Inter_500Medium',
  semibold: 'Inter_600SemiBold',
  arabic: 'IBMPlexSansArabic_400Regular',
  arabicBold: 'IBMPlexSansArabic_600SemiBold',
} as const;

export const text = {
  display: { fontFamily: fonts.heading, fontSize: 34, lineHeight: 40, letterSpacing: -0.5 },
  h1: { fontFamily: fonts.heading, fontSize: 26, lineHeight: 32, letterSpacing: -0.3 },
  h2: { fontFamily: fonts.heading, fontSize: 20, lineHeight: 26 },
  h3: { fontFamily: fonts.semibold, fontSize: 17, lineHeight: 24 },
  body: { fontFamily: fonts.regular, fontSize: 16, lineHeight: 24 },
  bodyMedium: { fontFamily: fonts.medium, fontSize: 16, lineHeight: 24 },
  small: { fontFamily: fonts.regular, fontSize: 14, lineHeight: 20 },
  label: { fontFamily: fonts.semibold, fontSize: 14, lineHeight: 20 },
  caption: { fontFamily: fonts.medium, fontSize: 12, lineHeight: 16 },
  overline: {
    fontFamily: fonts.semibold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
} satisfies Record<string, TextStyle>;

export type TextVariant = keyof typeof text;
