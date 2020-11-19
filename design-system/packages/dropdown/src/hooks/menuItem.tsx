/** @jsx jsx */

import { useTheme } from '@keystone-ui/core';
import { SizeKey } from '@keystone-ui/button/src';  // ?? todo - ??import location

type MenuItemTokensProps = {
	tone: 'passive' | 'active' | 'negative',
	isHighlighted: boolean,
	size: SizeKey,
	isDisabled: boolean,
}

type MenuItemTokens = {
	container: {
		[key: string]: any,
	},
	containerHover: {
		[key: string]: any,
	},
	containerFocus: {
		[key: string]: any,
	},
	icon: {
		[key: string]: any,
	}
}

type MenuItemStyles = {
	containerStyles: {
		[key: string]: any,
	},
	iconStyles: {
		[key: string]: any,
	},
	textStyles: {
		[key: string]: any,
	}
}

export const useMenuItemTokens = ({ tone, isHighlighted, size, isDisabled }: MenuItemTokensProps): MenuItemTokens => {
	const { spacing, typography, controlSizes, colors,
		// tones
	} = useTheme();

	// const tonePack = tones[tone];
	const sizePack = controlSizes[size];

	return {
		container: {
			color: isDisabled ? colors.foregroundDim : colors.foreground,
			height: sizePack.indicatorBoxSize,  //sizePack.boxSize,
			fontSize: typography.fontSize.small,
			fontWeight: typography.fontWeight.medium,
			backgroundColor: isHighlighted ? colors.backgroundDim : undefined,
			outline: isHighlighted ? 'none !important' : undefined,
			paddingHorizontal: spacing.large,
		},
		containerHover: {
			backgroundColor: colors.backgroundDim,
			outline: 'none !important',
		},
		containerFocus: {
			backgroundColor: colors.backgroundDim,
			outline: 'none !important',
		},
		icon: {
			marginHorizontal: spacing.small,
		},
	};
};

export const useMenuItemStyles = ({ tokens }: { tokens: MenuItemTokens }): MenuItemStyles => {
	const { container, containerHover, containerFocus, icon } = tokens;
	return {
		containerStyles: {
			alignItems: 'center',
			background: container.backgroundColor,
			border: 0,
			display: 'flex',
			color: container.color,
			cursor: 'pointer',
			fontSize: container.fontSize,
			fontWeight: container.fontWeight,
			height: container.height,
			paddingBottom: 0,
			paddingTop: 0,
			paddingLeft: container.paddingHorizontal,
			paddingRight: container.paddingHorizontal,
			position: 'relative',
			textAlign: 'left',
			width: '100%',
			outline: container.outline,
			':hover': {
				backgroundColor: containerHover.backgroundColor,
				outline: containerHover.outline,
			},
			':focus': {
				backgroundColor: containerFocus.backgroundColor,
				outline: containerFocus.outline,
			},
			':active': {
				backgroundColor: undefined,  //TODO palette.menuItem.backgroundPressed,
			},
			':disabled': {
				pointerEvents: 'none',
			},
		},
		iconStyles: {
			marginRight: icon.marginHorizontal,
		},
		textStyles: {
			flex: 1,
			minWidth: 0,
			maxWidth: '100%',
			overflow: 'hidden',
			textOverflow: 'ellipsis',
			whiteSpace: 'nowrap',
		}
	};
};
