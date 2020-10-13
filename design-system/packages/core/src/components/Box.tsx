/** @jsx jsx */

import { jsx } from '../emotion';

import { useTheme } from '../theme';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { forwardRefWithAs, mapResponsiveProp } from '../utils';
import { ResponsiveProp, Theme } from '../types';

// Types
// -----

type DimensionType = number | string;

type TextAlign = 'left' | 'right' | 'center' | 'justify' | 'start' | 'end';
type TextAlignment = ResponsiveProp<TextAlign>;

type ColorType = ResponsiveProp<keyof Theme['palette']>;
export type ColorProps = {
  /** background-color */
  background?: ColorType;
  /** color */
  foreground?: ColorType;
};

type RadiiType = ResponsiveProp<keyof Theme['radii']>;
export type RadiiProps = {
  /** border-radius */
  rounding?: RadiiType;
  /** border-bottom-left-radius and border-bottom-right-radius */
  roundingBottom?: RadiiType;
  /** border-bottom-left-radius and border-top-left-radius */
  roundingLeft?: RadiiType;
  /** border-bottom-right-radius and border-top-right-radius */
  roundingRight?: RadiiType;
  /** border-bottom-left-radius and border-bottom-right-radius */
  roundingTop?: RadiiType;
};

type SpacingType = ResponsiveProp<keyof Theme['spacing']>;
export type MarginProps = {
  /** margin */
  margin?: SpacingType;
  /** margin-top */
  marginTop?: SpacingType;
  /** margin-right */
  marginRight?: SpacingType;
  /** margin-bottom */
  marginBottom?: SpacingType;
  /** margin-left */
  marginLeft?: SpacingType;
  /** margin-top and margin-bottom */
  marginY?: SpacingType;
  /** margin-left and margin-right */
  marginX?: SpacingType;
};

export type PaddingProps = {
  /** padding */
  padding?: SpacingType;
  /** padding-top */
  paddingTop?: SpacingType;
  /** padding-right */
  paddingRight?: SpacingType;
  /** padding-bottom */
  paddingBottom?: SpacingType;
  /** padding-left */
  paddingLeft?: SpacingType;
  /** padding-top and padding-bottom */
  paddingY?: SpacingType;
  /** padding-left and padding-right */
  paddingX?: SpacingType;
};

type BaseBoxProps = {
  /** text-align */
  textAlign?: TextAlignment;
  /** height */
  height?: ResponsiveProp<DimensionType>;
  /** width */
  width?: ResponsiveProp<DimensionType>;
};

export type BoxProps = ColorProps & RadiiProps & MarginProps & PaddingProps & BaseBoxProps;

// Style Functions
// ---------------

export const useBoxStyles = ({
  background,
  foreground,
  height,
  margin,
  marginTop,
  marginRight,
  marginBottom,
  marginLeft,
  marginY,
  marginX,
  padding,
  paddingTop,
  paddingRight,
  paddingBottom,
  paddingLeft,
  paddingY,
  paddingX,
  rounding,
  roundingBottom,
  roundingLeft,
  roundingRight,
  roundingTop,
  textAlign,
  width,
}: BoxProps) => {
  const theme = useTheme();
  const { mq } = useMediaQuery();

  const resolvedColors = useColors(
    {
      background,
      foreground,
    },
    theme
  );

  const resolvedMargin = useMargin(
    {
      margin,
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      marginY,
      marginX,
    },
    theme
  );

  const resolvedPadding = usePadding(
    {
      padding,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      paddingY,
      paddingX,
    },
    theme
  );

  const resolvedRounding = useRadii(
    { rounding, roundingTop, roundingRight, roundingBottom, roundingLeft },
    theme
  );

  return mq({
    ...resolvedColors,
    ...resolvedMargin,
    ...resolvedPadding,
    ...resolvedRounding,
    boxSizing: 'border-box',
    height: height,
    textAlign: textAlign,
    width: width,
  });
};

// Utils
// ------------------------------

function useColors({ background, foreground }: ColorProps, { palette }: Theme) {
  return {
    backgroundColor: background && mapResponsiveProp(background, palette),
    color: foreground && mapResponsiveProp(foreground, palette),
  };
}

function useRadii(
  { rounding, roundingTop, roundingRight, roundingBottom, roundingLeft }: RadiiProps,
  { radii }: Theme
) {
  let borderBottomLeftRadius = roundingBottom || roundingLeft || rounding;
  let borderBottomRightRadius = roundingBottom || roundingRight || rounding;
  let borderTopLeftRadius = roundingTop || roundingLeft || rounding;
  let borderTopRightRadius = roundingTop || roundingRight || rounding;

  return {
    borderBottomLeftRadius:
      borderBottomLeftRadius && mapResponsiveProp(borderBottomLeftRadius, radii),
    borderBottomRightRadius:
      borderBottomRightRadius && mapResponsiveProp(borderBottomRightRadius, radii),
    borderTopLeftRadius: borderTopLeftRadius && mapResponsiveProp(borderTopLeftRadius, radii),
    borderTopRightRadius: borderTopRightRadius && mapResponsiveProp(borderTopRightRadius, radii),
  };
}

function usePadding(
  {
    padding,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    paddingY,
    paddingX,
  }: PaddingProps,
  { spacing }: Theme
) {
  let pb = paddingBottom || paddingY || padding;
  let pt = paddingTop || paddingY || padding;
  let pl = paddingLeft || paddingX || padding;
  let pr = paddingRight || paddingX || padding;

  return {
    paddingBottom: pb && mapResponsiveProp(pb, spacing),
    paddingTop: pt && mapResponsiveProp(pt, spacing),
    paddingLeft: pl && mapResponsiveProp(pl, spacing),
    paddingRight: pr && mapResponsiveProp(pr, spacing),
  };
}

function useMargin(
  { margin, marginTop, marginRight, marginBottom, marginLeft, marginY, marginX }: MarginProps,
  { spacing }: Theme
) {
  let mb = marginBottom || marginY || margin;
  let mt = marginTop || marginY || margin;
  let ml = marginLeft || marginX || margin;
  let mr = marginRight || marginX || margin;

  return {
    marginBottom: mb && mapResponsiveProp(mb, spacing),
    marginTop: mt && mapResponsiveProp(mt, spacing),
    marginLeft: ml && mapResponsiveProp(ml, spacing),
    marginRight: mr && mapResponsiveProp(mr, spacing),
  };
}

// Box Component
// -------------

export const Box = forwardRefWithAs<'div', BoxProps>(({ as: Tag = 'div', ...props }, ref) => {
  const {
    background,
    foreground,
    height,
    margin,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    marginY,
    marginX,
    padding,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    paddingY,
    paddingX,
    rounding,
    roundingBottom,
    roundingLeft,
    roundingRight,
    roundingTop,
    textAlign,
    width,
    ...attrs
  } = props;

  const boxStyles = useBoxStyles({
    background,
    foreground,
    height,
    margin,
    marginTop,
    marginRight,
    marginBottom,
    marginLeft,
    marginY,
    marginX,
    padding,
    paddingTop,
    paddingRight,
    paddingBottom,
    paddingLeft,
    paddingY,
    paddingX,
    rounding,
    roundingBottom,
    roundingLeft,
    roundingRight,
    roundingTop,
    textAlign,
    width,
  });

  return <Tag css={boxStyles} ref={ref} {...attrs} />;
});
