import React from 'react';
import BrandPicker from '../components/brand-picker';

const Homepage = () => {
	return (
		<div>
			<h1
				css={`
					color: red;
					font-size: 30px;
				`}
			>
				This is the landing page, welcome! 👋
			</h1>
			<p>Please select your brand!</p>
			<BrandPicker onClick={() => {}} />
			<p>
				It's so lovely to see you here. No, really. Look at you! Have fun visiting our website.
				Please leave a message in the guestbook!
			</p>
		</div>
	);
};

export default Homepage;
