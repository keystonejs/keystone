/** @jsx jsx */

import { createContext, useContext } from 'react';

export const BrandContext = createContext();

export const useBrand = () => {
	const brandObject = useContext(BrandContext);
	const errorMessage = `GEL components require that you wrap your application with the <GEL /> brand provider from @westpac/core.`;

	if (!brandObject) {
		throw new Error(errorMessage);
	}

	return brandObject;
};
