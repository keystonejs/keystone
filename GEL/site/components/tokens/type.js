/** @jsx jsx */
import { jsx, useBrand } from '@westpac/core';

export const Type = () => {
	const TOKENS = useBrand();
	return (
		<div
			css={{
				...TOKENS.TYPE.files,
				marginBottom: '3rem',
			}}
		>
			<span
				css={{
					display: 'block',
					fontSize: '3rem',
					margin: '1rem 0',
					fontFamily: TOKENS.TYPE.brandFont.fontFamily,
				}}
			>
				Brand font
			</span>

			<ul
				css={{
					listStyle: 'none',
					padding: 0,
					margin: 0,
				}}
			>
				{TOKENS.TYPE.brandFont.weights.map((weight, i) => (
					<li
						key={i}
						css={{
							display: 'block',
							fontSize: '2rem',
							fontFamily: TOKENS.TYPE.brandFont.fontFamily,
							fontWeight: weight,
						}}
					>
						weight {weight}
					</li>
				))}
			</ul>

			<span
				css={{
					display: 'block',
					fontSize: '3rem',
					margin: '1rem 0',
					fontFamily: TOKENS.TYPE.bodyFont.fontFamily,
				}}
			>
				Body font
			</span>

			<ul
				css={{
					listStyle: 'none',
					padding: 0,
					margin: 0,
				}}
			>
				{TOKENS.TYPE.bodyFont.weights.map((weight, i) => (
					<li
						key={i}
						css={{
							display: 'block',
							fontSize: '2rem',
							fontFamily: TOKENS.TYPE.bodyFont.fontFamily,
							fontWeight: weight,
						}}
					>
						weight {weight}
					</li>
				))}
			</ul>
		</div>
	);
};
