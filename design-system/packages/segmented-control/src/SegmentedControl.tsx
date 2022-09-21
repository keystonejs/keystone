/** @jsxRuntime classic */
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
  ChangeEventHandler,
  HTMLAttributes,
  ReactNode,
  forwardRef,
  useEffect,
  useRef,
  useState,
  InputHTMLAttributes,
} from 'react';

import {
  Box,
  BoxProps,
  jsx,
  ManagedChangeHandler,
  useId,
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
  /** Function to be called when one of the segments is selected. */
  onChange: ManagedChangeHandler<Index>;
  /** Provide labels for each segment. */
  segments: string[];
  /** To Disable */
  isDisabled?: boolean;
  /** Marks the component as read only */
  isReadOnly?: boolean;
  /** The the selected index of the segmented control. */
  selectedIndex: Index | undefined;
  /** The size of the controls. */
  size?: SizeKey;
  /** The width of the controls. */
  width?: WidthKey;
} & BoxProps;

export const SegmentedControl = ({
  animate = false,
  fill = false,
  onChange,
  segments,
  isDisabled = false,
  isReadOnly = false,
  size = 'medium',
  width = 'large',
  selectedIndex,
  ...props
}: SegmentedControlProps) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const [selectedRect, setSelectedRect] = useState({});

  // Because we use radio buttons for the segments, they should share a unique `name`
  const name = String(useId());

  // Animate the selected segment indicator
  useEffect(() => {
    if (animate && rootRef.current instanceof HTMLElement) {
      let nodes = Array.from(rootRef.current.children);
      let selected = selectedIndex !== undefined && nodes[selectedIndex];
      let rootRect;
      let nodeRect = { height: 0, width: 0, left: 0, top: 0 };
      let offsetLeft;
      let offsetTop;

      if (selected) {
        rootRect = rootRef.current.getBoundingClientRect();
        nodeRect = selected.getBoundingClientRect();
        offsetLeft = nodeRect.left - rootRect.left;
        offsetTop = nodeRect.top - rootRect.top;
      }

      setSelectedRect({
        height: nodeRect.height,
        width: nodeRect.width,
        left: 0,
        top: 0,
        transform: `translateX(${offsetLeft}px) translateY(${offsetTop}px)`,
      });
    }
  }, [animate, selectedIndex]);

  const nothingIsSelected = selectedIndex === undefined;
  // do we want to mark the radio item as disabled?
  const actuallyDisabled = isDisabled || (isReadOnly && !nothingIsSelected);

  return (
    <Box css={{ outline: 0, boxSizing: 'border-box' }} {...props}>
      <Root
        css={{ border: `1px solid ${isDisabled ? 'transparent' : '#e1e5e9'}` }}
        fill={fill}
        size={size}
        ref={rootRef}
        width={width}
      >
        {segments.map((label, idx) => {
          const isSelected = selectedIndex === idx;

          return (
            <Item
              fill={fill}
              isAnimated={animate}
              isSelected={isSelected}
              disabled={isDisabled}
              readOnly={isReadOnly}
              key={label}
              name={name}
              onChange={event => {
                onChange(idx, event);
              }}
              size={size}
              value={idx}
            >
              {label}
            </Item>
          );
        })}
        <VisuallyHidden as="label">
          None Selected
          <VisuallyHidden
            as="input"
            type="radio"
            checked={nothingIsSelected}
            disabled={actuallyDisabled}
            value="none"
          />
        </VisuallyHidden>
        {animate && selectedIndex! > -1 ? (
          <SelectedIndicator size={size} style={selectedRect} />
        ) : null}
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

type BaseInputProps = {
  children: ReactNode;
  fill: boolean;
  isAnimated: boolean;
  isSelected: boolean;
  readOnly: boolean;
  onChange: ChangeEventHandler<HTMLInputElement>;
  name: string;
  size: SizeKey;
  value: Index;
};

type ItemProps = BaseInputProps & Omit<InputHTMLAttributes<HTMLInputElement>, keyof BaseInputProps>;

const Item = (props: ItemProps) => {
  const {
    children,
    fill,
    isAnimated,
    isSelected,
    onChange,
    size,
    value,
    disabled,
    readOnly,
    ...attrs
  } = props;
  const { colors, fields, typography } = useTheme();
  const sizeStyles = useItemSize();
  const selectedStyles = useSelectedStyles();
  const inputRef = useRef(null);

  // do we want to mark the radio item as disabled?
  const isDisabled = disabled || (readOnly && !isSelected);

  return (
    <label
      css={{
        ...sizeStyles[size],
        ...(!isAnimated && isSelected && selectedStyles),
        boxSizing: 'border-box',
        cursor: props.disabled ? undefined : 'pointer',
        flex: fill ? 1 : undefined,
        fontWeight: typography.fontWeight.medium,
        textAlign: 'center',
        position: 'relative',
        zIndex: 2,
        border: '1px solid transparent',
        ':focus-within': {
          boxShadow: '0 0 0 2px #bfdbfe;',
          border: '1px solid #166bff;',
        },
        ...(readOnly && {
          ':focus-within': {
            boxShadow: '0 0 0 2px #e1e5e9',
            border: '1px solid #b1b5b9',
          },
        }),
        ...(props.disabled || readOnly
          ? {}
          : {
              ':hover': {
                color: !isSelected ? colors.linkHoverColor : undefined,
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
              },
            }),
        ':active': {
          backgroundColor: !isSelected ? fields.hover.inputBackground : undefined,
        },
      }}
    >
      <VisuallyHidden
        ref={inputRef}
        as="input"
        type="radio"
        onChange={onChange}
        value={value}
        checked={isSelected}
        disabled={isDisabled}
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
  const { colors } = useTheme();
  return {
    background: colors.background,
    boxShadow: '0px 1px 4px rgba(45, 55, 72, 0.07);', // used to be shadow.s100
  };
};
