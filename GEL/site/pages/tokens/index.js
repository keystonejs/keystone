/** @jsx jsx */
import { useEffect, useState } from 'react';
import { jsx, useBrand } from '@westpac/core';

import Colors from '../../../../components/core/examples/00-tokens-colors';
import Spacing from '../../../../components/core/examples/20-tokens-spacing';
import Type from '../../../../components/core/examples/30-tokens-type';
import Packs from '../../../../components/core/examples/40-tokens-packs';
import Layout from '../../components/layout';

const TokensPage = () => {
	const brand = useBrand();
	return (
		<Layout>
			<Colors brand={brand} />
			<Spacing brand={brand} />
			<Type brand={brand} />
			<Packs brand={brand} />
		</Layout>
	);
};

export default TokensPage;
