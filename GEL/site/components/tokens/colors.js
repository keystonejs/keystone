/** @jsx jsx */
import { jsx, useBrand } from '@westpac/core';

export const Colors = () => {
	const TOKENS = useBrand();
	const { tints, ...primaryColors } = TOKENS.COLORS;
	return (
		<ul css={{ listStyle: 'none', margin: 0, padding: 0 }}>
			{Object.entries(primaryColors)
				.sort()
				.map(([primaryColor, color], i) => (
					<Color color={color} primaryColor={primaryColor} tints={tints} key={i} />
				))}
		</ul>
	);
};

const Color = ({ primaryColor, color, tints }) => (
	<li css={{ display: 'block' }}>
		<span
			css={{
				verticalAlign: 'middle',
				display: 'inline-block',
				minWidth: '7em',
			}}
		>
			{primaryColor}:
		</span>
		<div
			css={{
				display: 'inline-block',
				verticalAlign: 'middle',
				background: color,
				width: '3rem',
				height: '3rem',
			}}
		/>
		<ul
			css={{
				listStyle: 'none',
				margin: 0,
				padding: 0,
				marginLeft: '1rem',
				display: 'inline',
			}}
		>
			{[90, 80, 70, 60, 50, 40, 30, 20, 10, 5].map((shade, i) => (
				<li key={i} css={{ display: 'inline-block' }}>
					<div
						css={{
							display: 'inline-grid',
							alignContent: 'center',
							textAlign: 'center',
							textShadow: '0 0 1px #fff',
							background: tints[primaryColor + shade],
							width: '3rem',
							height: '3rem',
						}}
					>
						{shade}
					</div>
				</li>
			))}
		</ul>
	</li>
);
