import { useTheme } from '@keystone-ui/core';

export const segmentedControlSizeValues = ['large', 'medium', 'small'] as const;

// TODO: Move to theme.
export const widthMap = {
  small: 128,
  medium: 256,
  large: 512,
  full: '100%',
};

export type SizeKey = typeof segmentedControlSizeValues[number];
export type WidthKey = 'small' | 'medium' | 'large' | 'full';

export type ControlTokensProps = {
  size: SizeKey;
  width: WidthKey;
};
export type ControlTokens = {
  borderRadius: number | string;
  paddingX: number | string;
  paddingY: number | string;
  width: number | string;
};

export const useControlTokens = ({
  size: sizeKey,
  width: widthKey,
}: ControlTokensProps): ControlTokens => {
  const { controlSizes } = useTheme();
  const size = controlSizes[sizeKey];
  const width = widthMap[widthKey];
  return {
    borderRadius: size.borderRadius,
    paddingX: size.gutter,
    paddingY: size.gutter,
    width,
  };
};

export const useItemTokens = () => {};
