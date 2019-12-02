/** @jsx jsx */
import { jsx, useBrand } from '@westpac/core';

export const Packs = () => {
	const TOKENS = useBrand();
	return Object.entries(TOKENS.PACKS.headline).map((pack, i) => {
		return <Headline pack={pack} key={i} />;
	});
};

const Headline = ({ pack: [name, styles] }) => (
	<div>
		<span
			css={{
				color: '#7c7c7c',
				textTransform: 'uppercase',
				fontSize: 12,
				letterSpacing: 2,
			}}
		>
			Headline {name}
		</span>
		<p css={[styles, { marginTop: 0 }]}>The quick brown fox jumps over the lazy dog</p>
	</div>
);
