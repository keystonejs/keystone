import React, { createContext, useContext, useState } from 'react';

import bomBrand from '@westpac/bom';
import bsaBrand from '@westpac/bsa';
import btfgBrand from '@westpac/btfg';
import stgBrand from '@westpac/stg';
import wbcBrand from '@westpac/wbc';
import wbgBrand from '@westpac/wbg';

// ==============================
// Get the data
// ==============================

const BRANDS = {
	BOM: bomBrand,
	BSA: bsaBrand,
	BTFG: btfgBrand,
	STG: stgBrand,
	WBC: wbcBrand,
	WBG: wbgBrand,
};

const BrandSwitcherContext = createContext();

const BrandSwitcherProvider = ({ children }) => {
	const [brand, setBrand] = useState('BOM');
	return (
		<BrandSwitcherContext.Provider
			value={{
				brands: BRANDS,
				brand,
				setBrand,
			}}
		>
			{children}
		</BrandSwitcherContext.Provider>
	);
};

const useBrandSwitcher = () => {
	const context = useContext(BrandSwitcherContext);
	if (!context) {
		throw new Error('Trying to use the BrandSwitcherContext outside of a <BrandSwitcherProvider>.');
	}
	return context;
};

export { BrandSwitcherProvider, useBrandSwitcher };
