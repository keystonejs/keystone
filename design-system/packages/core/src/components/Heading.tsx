/** @jsx jsx */

import { jsx } from '../emotion';

import { Box, BoxProps } from './Box';
import { forwardRefWithAs } from '../utils';
import { useTheme } from '../theme';

export const HeadingTypes = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] as const;
type HeadingType = typeof HeadingTypes[number];

type HeadingProps = {
  /** The type of heading. */
  type?: HeadingType;
} & BoxProps;

export const Heading = forwardRefWithAs<'h1', HeadingProps>(
  ({ as = 'h1', type = 'h1', ...props }, ref) => {
    const { headingStyles } = useTheme();
    const headingStyle = headingStyles[type];
    const styles = {
      color: headingStyle.color,
      fontFamily: headingStyle.family,
      fontSize: headingStyle.size,
      fontWeight: headingStyle.weight,
      textTransform: headingStyle.transform,
      margin: 0,
    } as const;
    return <Box as={as} css={styles} ref={ref} {...props} />;
  }
);

export const H1 = forwardRefWithAs<'h1', BoxProps>(({ as = 'h1', ...props }, ref) => {
  return <Heading ref={ref} as={as} type="h1" {...props} />;
});

export const H2 = forwardRefWithAs<'h2', BoxProps>(({ as = 'h2', ...props }, ref) => {
  return <Heading ref={ref} as={as} type="h2" {...props} />;
});

export const H3 = forwardRefWithAs<'h3', BoxProps>(({ as = 'h3', ...props }, ref) => {
  return <Heading ref={ref} as={as} type="h3" {...props} />;
});

export const H4 = forwardRefWithAs<'h4', BoxProps>(({ as = 'h4', ...props }, ref) => {
  return <Heading ref={ref} as={as} type="h4" {...props} />;
});

export const H5 = forwardRefWithAs<'h5', BoxProps>(({ as = 'h5', ...props }, ref) => {
  return <Heading ref={ref} as={as} type="h5" {...props} />;
});

export const H6 = forwardRefWithAs<'h6', BoxProps>(({ as = 'h6', ...props }, ref) => {
  return <Heading ref={ref} as={as} type="h6" {...props} />;
});
