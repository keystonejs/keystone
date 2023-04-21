import { useTheme } from '@keystone-ui/core';

export const noticeToneValues = [
  'active',
  'passive',
  'positive',
  'warning',
  'negative',
  'help',
] as const;

export type ToneKey = typeof noticeToneValues[number];

type NoticeTokensProps = {
  tone: ToneKey;
};

export type NoticeTokens = {
  background?: string;
  borderColor?: string;
  borderRadius?: number;
  borderWidth?: number;
  fontSize?: number | string;
  fontWeight?: number;
  foreground?: string;
  gap: number;
  iconColor: string;
  paddingX?: number;
  paddingY?: number;
  shadow?: string;
  title: {
    foreground: string;
    fontSize?: number | string;
    fontWeight?: number;
  };
};

export function useNoticeTokens({ tone: toneKey }: NoticeTokensProps): NoticeTokens {
  const { colors, radii, tones, typography, spacing } = useTheme();
  const tone = tones[toneKey];

  const tokens: NoticeTokens = {
    background: tone.tint[0],
    borderColor: tone.border[0],
    borderRadius: radii.medium,
    borderWidth: 1,
    fontSize: typography.fontSize.small,
    fontWeight: typography.fontWeight.medium,
    foreground: colors.foregroundDim,
    gap: spacing.medium,
    iconColor: tone.foreground[0],
    paddingX: spacing.large,
    paddingY: spacing.large,
    title: {
      foreground: colors.foreground,
      fontSize: typography.fontSize.medium,
      fontWeight: typography.fontWeight.medium,
    },
  };

  return tokens;
}

type NoticeStylesProps = {
  tokens: NoticeTokens;
};

export function useNoticeStyles({ tokens }: NoticeStylesProps) {
  const actions = {
    marginTop: tokens.gap,
  };

  const box = {
    backgroundColor: tokens.background,
    borderColor: tokens.borderColor || 'transparent',
    borderRadius: tokens.borderRadius,
    borderWidth: tokens.borderWidth,
    color: tokens.foreground,
    fontSize: tokens.fontSize,
    fontWeight: tokens.fontWeight,
    paddingLeft: tokens.paddingX,
    paddingRight: tokens.paddingX,
    paddingTop: tokens.paddingY,
    paddingBottom: tokens.paddingY,
  };

  const title = {
    color: tokens.title.foreground,
    fontSize: tokens.title.fontSize,
    fontWeight: tokens.title.fontWeight,
    marginBottom: tokens.gap / 2,
  };

  const symbol = {
    color: tokens.iconColor,
    marginRight: tokens.gap,
  };

  return { actions, box, title, symbol };
}
