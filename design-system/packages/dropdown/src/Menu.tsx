/** @jsx jsx */
import { ComponentType, forwardRef, ReactNode, HTMLAttributes } from 'react';
import { jsx, useId } from '@keystone-ui/core';
import { IconProps } from '@keystone-ui/icons';

import { useMenuTokens, useMenuStyles } from './hooks/menu';
import { useMenuGroupStyles, useMenuGroupTokens } from './hooks/menuGroup';
import { useMenuItemStyles, useMenuItemTokens } from './hooks/menuItem';


// Menu Provider
// ------------------------------

type MenuProps = {
  children: ReactNode;
};

export const Menu = forwardRef<HTMLDivElement, MenuProps>(
  ({ children, ...props }, ref) => {
    const tokens = useMenuTokens();
    const styles = useMenuStyles({ tokens });
    return (
      <div
        role="menu"
        ref={ref}
        css={styles}
        {...props}
      >
        {children}
      </div>
    );
  }
);

// Menu Groups & Divider
// ------------------------------

type GroupProps = {
  children: ReactNode;
  title?: string;
};
export const MenuGroup = ({ children, title, ...props }: GroupProps) => {
  const tokens = useMenuGroupTokens();
  const { containerStyles, titleStyles } = useMenuGroupStyles({ tokens });

  const titleId = useId();

  return (
    <div
      aria-describedby={titleId}
      role="group"
      css={containerStyles}
      {...props}
    >
      {title && (
        <h6
          id={titleId}
          css={titleStyles}
        >
          {title}
        </h6>
      )}
      {children}
    </div>
  );
};

export const MenuDivider = () => {
  const tokens = useMenuGroupTokens();
  const styles = useMenuGroupStyles({ tokens });

  return (
    <div
      role="separator"
      css={styles}
    />
  );
};


// Menu Item
// ------------------------------

type MenuItemProps = {
  /** Determines if the menu item trigger is disabled */
  isDisabled?: boolean;
  /** An optional icon placed to the left of the label */
  icon?: ComponentType<IconProps>;
  /** Alternative "faux" highlighting when the item may not receive real focus */
  isHighlighted?: boolean;
  /** Describe the action of the item with the label */
  label: string;
  /** An event handler for when the item is clicked */
  onClick?: (event: MouseEvent) => void;
  /** The role of the item */
  role?: 'menuitem' | 'menuitemradio' | 'menuitemcheckbox' | 'option';
  /** The tone of the action this item represents */
  tone?: 'passive' | 'active' | 'negative';
} & HTMLAttributes<HTMLButtonElement>;

export const MenuItem = forwardRef<HTMLButtonElement, MenuItemProps>(
  (props, ref) => {
    const {
      label,
      icon: Icon,
      isHighlighted = false,
      role = 'menuitem',
      tone = 'passive',
      isDisabled = false,
      ...consumerProps
    } = props;

    const tokens = useMenuItemTokens({ tone, isHighlighted, size: 'medium', isDisabled });
    const { containerStyles, iconStyles, textStyles } = useMenuItemStyles({ tokens });

    // NOTE: must be a button element so click events extend to "Enter/Space" keypress
    return (
      <button
        ref={ref}
        type="button"
        css={containerStyles}
        role={role}
        tabIndex={0}
        {...consumerProps}
      >
        {Icon && <Icon size="small" css={iconStyles} />}
        <div css={textStyles}>
          {label}
        </div>
      </button>
    );
  }
);
