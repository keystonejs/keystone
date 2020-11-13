/** @jsx jsx */

/**
 * # TODO
 *
 * - [ ] Turn inlined css into tokens and style functions
 * - [ ] Review where the default tokens are coming from
 * - [ ] Update the API from `segments` to react-select style `options`
 * - [ ] Fix the animate-on-first-render bug for the selected indicator
 * - [ ] Turn `isAnimated` default into a theme token (?)
 * - [ ] Support `selectableColors` from the theme for the options
 */

import {
  ChangeEvent,
  ChangeEventHandler,
  HTMLAttributes,
  ReactNode,
  forwardRef,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Box,
  BoxProps,
  jsx,
  ManagedChangeHandler,
  useId,
  useManagedState,
  useTheme,
  VisuallyHidden,
} from '@keystone-ui/core';

import { SizeKey, WidthKey, useControlTokens } from './hooks/segmentedControl';

type Index = number;

// SegmentedControl
// ------------------------------

type SegmentedControlProps = {
  /** Whether the selected control indicator should animate its movement. */
  animate?: boolean;
  /** Whether the controls should take up the full width of their container. */
  fill?: boolean;
  /** Provide an initial index for an uncontrolled segmented control. */
  initialIndex?: Index;
  /** Function to be called when one of the segments is selected. */
  onChange?: ManagedChangeHandler<Index>;
  /** Provide labels for each segment. */
  segments: string[];
  /** The the selected index of the segmented control. */
  selectedIndex?: Index;
  /** The size of the controls. */
  size?: SizeKey;
  /** The width of the controls. */
  width?: WidthKey;
} & BoxProps;

export const SegmentedControl = ({
  animate = false,
  fill = false,
  initialIndex: initialIndexProp = 0,
  onChange: onChangeProp,
  segments,
  size = 'medium',
  width = 'large',
  selectedIndex: selectedIndexProp,
  ...props
}: SegmentedControlProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [selectedRect, setSelectedRect] = useState({});
  const [selectedIndex, setIndex] = useManagedState<Index>(
    selectedIndexProp,
    initialIndexProp,
    onChangeProp
  );

  const handleChange = (index: Index) => (event: ChangeEvent<HTMLInputElement>) => {
    setIndex(index, event);
  };

  // Because we use radio buttons for the segments, they should share a unique `name`
  const name = String(useId());

  // Animate the selected segment indicator
  useEffect(() => {
    if (animate && rootRef.current instanceof HTMLElement) {
      let nodes = Array.from(rootRef.current.children);
      let selected = nodes[selectedIndex];

      let rootRect = rootRef.current.getBoundingClientRect();
      let nodeRect = selected.getBoundingClientRect();
      let offsetLeft = nodeRect.left - rootRect.left;
      let offsetTop = nodeRect.top - rootRect.top;

      setSelectedRect({
        height: nodeRect.height,
        width: nodeRect.width,
        left: 0,
        top: 0,
        transform: `translateX(${offsetLeft}px) translateY(${offsetTop}px)`,
      });
    }
  }, [animate, selectedIndex]);

  return (
    <Box {...props}>
      <Root fill={fill} size={size} ref={rootRef} width={width}>
        {segments.map((label, idx) => {
          const isSelected = selectedIndex === idx;

          return (
            <Item
              fill={fill}
              isAnimated={animate}
              isSelected={isSelected}
              key={label}
              name={name}
              onChange={handleChange(idx)}
              size={size}
              value={idx}
            >
              {label}
            </Item>
          );
        })}
        {animate && <SelectedIndicator size={size} style={selectedRect} />}
      </Root>
    </Box>
  );
};

// Styled Components
// ------------------------------

type RootProps = {
  fill: boolean;
  size: SizeKey;
  width: WidthKey;
} & HTMLAttributes<HTMLDivElement>;

const Root = forwardRef<HTMLDivElement, RootProps>(({ fill, size, width, ...props }, ref) => {
  const { colors } = useTheme();
  const tokens = useControlTokens({ size, width });

  return (
    <div
      ref={ref}
      css={{
        borderRadius: tokens.borderRadius,
        paddingLeft: tokens.paddingX,
        paddingRight: tokens.paddingX,
        paddingTop: tokens.paddingY,
        paddingBottom: tokens.paddingY,
        userSelect: 'none',
        // -- TODO
        background: colors.backgroundDim,
        display: fill ? 'flex' : 'inline-flex',
        flexWrap: 'wrap',
        maxWidth: tokens.width,
        justifyContent: 'space-between',
        lineHeight: 1,
        position: 'relative',
      }}
      {...props}
    />
  );
});

type ItemProps = {
  children: ReactNode;
  fill: boolean;
  isAnimated: boolean;
  isSelected: boolean;
  onChange: ChangeEventHandler;
  name: string;
  size: SizeKey;
  value: Index;
} & HTMLAttributes<HTMLInputElement>;

const Item = (props: ItemProps) => {
  const { children, fill, isAnimated, isSelected, onChange, size, value, ...attrs } = props;
  const { colors, fields, typography } = useTheme();
  const sizeStyles = useItemSize();
  const selectedStyles = useSelectedStyles();

  return (
    <label
      css={{
        ...sizeStyles[size],
        ...(!isAnimated && isSelected && selectedStyles),
        boxSizing: 'border-box',
        cursor: 'pointer',
        flex: fill ? 1 : undefined,
        fontWeight: typography.fontWeight.medium,
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,

        ':hover': {
          color: !isSelected ? colors.linkHoverColor : undefined,
        },
        ':active': {
          backgroundColor: !isSelected ? fields.hover.inputBackground : undefined,
        },
      }}
    >
      <VisuallyHidden
        as="input"
        type="radio"
        onChange={onChange}
        value={value}
        checked={isSelected}
        {...attrs}
      />
      {children}
    </label>
  );
};

type IndicatorProps = { size: SizeKey } & HTMLAttributes<HTMLDivElement>;
const SelectedIndicator = ({ size, ...props }: IndicatorProps) => {
  const sizeStyles = useItemSize();
  const selectedStyles = useSelectedStyles();

  return (
    <div
      css={{
        ...sizeStyles[size],
        ...selectedStyles,
        boxSizing: 'border-box',
        position: 'absolute',
        transitionProperty: 'height,transform,width',
        transitionDuration: '200ms',
        transitionTimingFunction: 'cubic-bezier(.4,1,.75,.9)',
        zIndex: 1,
      }}
      {...props}
    />
  );
};

// Utils
// ------------------------------

const useItemSize = () => {
  const { spacing, typography, radii } = useTheme();
  return {
    small: {
      borderRadius: radii.xsmall,
      fontSize: typography.fontSize.small,
      paddingLeft: spacing.medium,
      paddingRight: spacing.medium,
      paddingBottom: spacing.small,
      paddingTop: spacing.small,
    },
    medium: {
      borderRadius: radii.xsmall,
      fontSize: typography.fontSize.small,
      paddingLeft: spacing.medium,
      paddingRight: spacing.medium,
      paddingBottom: spacing.small,
      paddingTop: spacing.small,
    },
    large: {
      borderRadius: radii.small,
      fontSize: typography.fontSize.medium,
      paddingLeft: spacing.large,
      paddingRight: spacing.large,
      paddingBottom: spacing.medium,
      paddingTop: spacing.medium,
    },
  };
};
const useSelectedStyles = () => {
  const { colors, shadow } = useTheme();
  return {
    background: colors.background,
    boxShadow: shadow.s100,
  };
};
