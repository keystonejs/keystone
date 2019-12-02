/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { HouseIcon } from '@westpac/icon';
import { Alert } from '@westpac/alert';

const CloseBtnNew = ({ onClose, icon: Icon, closable, look, ...rest }) => (
	<button onClick={() => onClose()} {...rest}>
		Close <Icon />
	</button>
);

const Heading = ({ children }) => (
	<h3 css={{ margin: '0 0 0.5rem 0', color: 'red !important' }}>{children}</h3>
);

function Example({ brand }) {
	const overridesWithTokens = { ...brand };
	overridesWithTokens['@westpac/alert'] = {
		innerCSS: {
			outline: '1px solid red',
		},
		info: {
			icon: HouseIcon,
			css: {
				color: 'rebeccapurple',
				padding: '4rem 0.5rem',
			},
		},
		duration: 5000,
		CloseBtn: CloseBtnNew,
		Heading,
	};

	return (
		<GEL brand={overridesWithTokens}>
			<h2>With overrides applied</h2>
			<Alert>
				This is a default alert. <a href="#">Link</a>
			</Alert>

			<Alert look="system" heading="System Error 8942" closable>
				The server is no responding. Please try again later. Sorry for the inconvenience. Hey neato,
				I can be closed. <a href="#">Link</a>
			</Alert>

			<hr />

			<h3>Alert heading</h3>
			<Alert heading="This is a Heading">
				This alert needs your attention, but it’s not super important. Lorem ipsum dolor sit amet,
				consectetur adipisicing elit. Quo dolor provident quasi nisi officia tempore fuga autem,
				animi iste molestiae, qui omnis doloribus aliquid ipsam rem fugiat veniam voluptatem
				accusamus! Lorem ipsum dolor sit amet, consectetur adipisicing elit. Est, unde quis,
				molestias nisi quae voluptates nemo quaerat nihil, consequuntur nobis ratione rerum
				asperiores eveniet dicta maiores quia nostrum. Pariatur, natus. Lorem ipsum dolor sit amet,
				consectetur adipisicing elit. Fuga, magnam illum harum consequatur, quo sunt impedit quam
				minus eaque saepe voluptas corrupti voluptatum, sapiente dolor sequi tempore maxime? Neque,
				obcaecati. <a href="#">Link</a>
			</Alert>

			<hr />

			<h3>Alert heading</h3>
			<Alert look="success" closable>
				<strong>Well done!</strong> You successfully read this important alert message. Hey neato, I
				can be closed. <a href="#">Link</a>
			</Alert>
		</GEL>
	);
}

export default Example;
