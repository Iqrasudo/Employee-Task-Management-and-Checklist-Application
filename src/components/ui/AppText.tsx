import React from 'react';
import { Text, TextProps } from 'react-native';
import { colors, localFont, text, TextVariant } from '../../theme';

type Props = TextProps & {
  variant?: TextVariant;
  color?: string;
  align?: 'left' | 'center' | 'right';
};

export function AppText({ variant = 'body', color = colors.text, align, style, ...rest }: Props) {
  return <Text {...rest} style={[text[variant], { color, fontFamily: localFont(text[variant].fontFamily) }, align ? { textAlign: align } : null, style]} />;
}
