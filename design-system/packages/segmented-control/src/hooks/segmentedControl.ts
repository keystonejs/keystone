import { useTheme } from '@keystone-ui/core';

export const segmentedControlSizeValues = ['large', 'medium', 'small'] as const;

export type SizeKey = typeof segmentedControlSizeValues[number];

export type ControlTokensProps = {
  size: SizeKey;
};
export type ControlTokens = {
  borderRadius: number | string;
  paddingX: number | string;
  paddingY: number | string;
};

export const useControlTokens = ({ size: sizeKey }: ControlTokensProps): ControlTokens => {
  const { controlSizes } = useTheme();
  const size = controlSizes[sizeKey];
  return {
    borderRadius: size.borderRadius,
    paddingX: size.gutter,
    paddingY: size.gutter,
  };
};

export const useItemTokens = () => {};
