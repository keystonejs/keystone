/** @jsx jsx */
import { Fragment, useState } from 'react';

import { jsx, useBrand } from '@westpac/core';
export const Spacing = () => {
	const TOKENS = useBrand();
	const { tints, ...primaryColors } = TOKENS.COLORS;
	const [showMinor, setShowMinor] = useState(true);

	return (
		<Fragment>
			<label>
				Show Minor:{' '}
				<input type="checkbox" checked={showMinor} onChange={() => setShowMinor(!showMinor)} />
			</label>
			<ul
				css={{
					listStyle: 'none',
					margin: 0,
					padding: 0,
				}}
			>
				{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((unit, i) => (
					<li
						key={i}
						css={{
							verticalAlign: 'middle',
							background: i % 2 ? 'transparent' : primaryColors.background,
						}}
					>
						<span
							css={{
								display: 'inline-block',
								minWidth: '1.5em',
								marginLeft: '0.5em',
							}}
						>
							{unit}
						</span>
						<div
							css={{
								display: 'inline-block',
								verticalAlign: 'middle',
								marginLeft: '1rem',
							}}
						>
							<div
								css={{
									width: TOKENS.SPACING(unit, 'minor'),
									height: '1rem',
									border: `1px solid ${primaryColors.borderDark}`,
									background: primaryColors.background,
									margin: '0.5rem 0',
									opacity: showMinor ? 1 : 0,
									transition: 'opacity 0.3s ease',
								}}
							/>
							<div
								css={{
									width: TOKENS.SPACING(unit),
									height: '1rem',
									border: `1px solid ${primaryColors.borderDark}`,
									background: primaryColors.primary,
									margin: '0.5rem 0',
								}}
							/>
						</div>
					</li>
				))}
			</ul>
		</Fragment>
	);
};
