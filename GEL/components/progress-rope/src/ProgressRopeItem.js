/** @jsx jsx */

import PropTypes from 'prop-types';
import { jsx, useBrand } from '@westpac/core';
import { useProgressRopeContext } from './ProgressRope';

export const ProgressRopeItem = ({ index, groupIndex, review, ...props }) => {
	const { currStep, currGroup, grouped, ropeGraph } = useProgressRopeContext();
	const { COLORS } = useBrand();

	const visited =
		(grouped && !review && ropeGraph[groupIndex][index] === 'visited') ||
		((!grouped || review) && ropeGraph[index][0] === 'visited');

	const active =
		(!grouped && index === currStep) ||
		(index === currStep && groupIndex === currGroup) ||
		(review && index === currGroup);

	let furthest = false;

	if (visited) {
		if (grouped && !review) {
			if (ropeGraph[groupIndex][index + 1] && ropeGraph[groupIndex][index + 1] === 'unvisited') {
				furthest = true;
			} else if (
				!ropeGraph[groupIndex][index + 1] &&
				ropeGraph[groupIndex + 1] &&
				ropeGraph[groupIndex + 1][0] === 'unvisited'
			) {
				furthest = true;
			}
		} else if (ropeGraph[index + 1] && ropeGraph[index + 1][0] === 'unvisited') {
			furthest = true;
		}
	}

	return (
		<li
			css={{
				padding: `0.5rem 3.5rem 0.875rem ${grouped && !review ? '3rem' : '1.875rem'}`,
				position: 'relative',

				a: {
					color: active ? COLORS.primary : visited ? COLORS.neutral : COLORS.tints.muted90,
					textDecoration: 'none',
					pointerEvents: active || visited ? 'auto' : 'none',
				},

				// the line
				'::before': {
					content: review ? 'none' : "''",
					display: 'block',
					position: 'absolute',
					borderLeft: `2px solid ${visited && !furthest ? COLORS.primary : COLORS.border}`,
					top: 0,
					right: '2.25rem',
					bottom: 0,
					height: 'auto',
					transform: 'translateY(0.625rem)',
				},

				// the circle
				':after': {
					content: "''",
					zIndex: 1,
					display: 'block',
					borderRadius: '50%',
					position: 'absolute',
					top: '0.625rem',
					width: grouped && !review ? '0.375rem' : '0.875rem',
					height: grouped && !review ? '0.375rem' : '0.875rem',
					right: grouped && !review ? '2.125rem' : '1.875rem',
					border: `2px solid ${visited ? COLORS.primary : COLORS.border}`,
					backgroundColor: grouped || review ? (visited ? COLORS.primary : COLORS.border) : '#fff',
					boxSizing: 'border-box',
				},

				':last-child': {
					...(grouped && !review && { paddingBottom: '2.75rem' }),
				},
			}}
			{...props}
		/>
	);
};

// ==============================
// Types
// ==============================
ProgressRopeItem.propTypes = {
	/** Whether or not a review step*/
	review: PropTypes.bool,
};

ProgressRopeItem.defaultProps = {
	review: false,
};
