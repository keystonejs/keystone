import React from 'react';
import Nav from '../nav';
import BrandSwitcher from '../brand-switcher';

const Sidebar = ({ components }) => {
	return (
		<div>
			<p>Brand logo</p>
			<BrandSwitcher />
			<Nav components={components} />
		</div>
	);
};

export default Sidebar;
