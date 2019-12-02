/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Button } from '@westpac/button';
import {
	HouseIcon,
	AlertIcon,
	ChatIcon,
	AccessibilityIcon,
	ArrowLeftIcon,
	ArrowRightIcon,
	StarIcon,
} from '@westpac/icon';

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<h2>Icon after</h2>
			<Button look="primary" size="small" iconAfter={HouseIcon}>
				Small
			</Button>{' '}
			<Button look="primary" size="medium" iconAfter={AlertIcon}>
				Medium
			</Button>{' '}
			<Button look="primary" size="large" iconAfter={ChatIcon}>
				Large
			</Button>{' '}
			<Button look="primary" size="xlarge" iconAfter={AccessibilityIcon}>
				Extra large
			</Button>
			<br />
			<br />
			<Button look="primary" size="xlarge" iconAfter={ArrowRightIcon} block>
				Extra large block
			</Button>
			<br />
			<Button look="primary" size="small" iconAfter={ArrowRightIcon} block justify>
				Small block justify
			</Button>
			<br />
			<Button look="primary" size="medium" iconAfter={ArrowRightIcon} block justify>
				Medium block justify
			</Button>
			<br />
			<Button look="primary" size="large" iconAfter={ArrowRightIcon} block justify>
				Large block justify
			</Button>
			<br />
			<Button look="primary" size="xlarge" iconAfter={ArrowRightIcon} block justify>
				Extra large block justify
			</Button>
			<hr />
			<h2>Icon before</h2>
			<Button look="primary" size="small" iconBefore={HouseIcon}>
				Small
			</Button>{' '}
			<Button look="primary" size="medium" iconBefore={AlertIcon}>
				Medium
			</Button>{' '}
			<Button look="primary" size="large" iconBefore={ChatIcon}>
				Large
			</Button>{' '}
			<Button look="primary" size="xlarge" iconBefore={AccessibilityIcon}>
				Extra large
			</Button>
			<br />
			<br />
			<Button look="primary" size="xlarge" iconBefore={ArrowLeftIcon} block>
				Extra large block
			</Button>
			<br />
			<Button look="primary" size="small" iconBefore={ArrowLeftIcon} block justify>
				Small block justify
			</Button>
			<br />
			<Button look="primary" size="medium" iconBefore={ArrowLeftIcon} block justify>
				Medium block justify
			</Button>
			<br />
			<Button look="primary" size="large" iconBefore={ArrowLeftIcon} block justify>
				Large block justify
			</Button>
			<br />
			<Button look="primary" size="xlarge" iconBefore={ArrowLeftIcon} block justify>
				Extra large block justify
			</Button>
			<hr />
			<h2>Icon only (no text)</h2>
			<Button look="primary" size="small" iconBefore={StarIcon} />{' '}
			<Button look="primary" size="medium" iconBefore={StarIcon} />{' '}
			<Button look="primary" size="large" iconBefore={StarIcon} />{' '}
			<Button look="primary" size="xlarge" iconBefore={StarIcon} />
			<br />
			<br />
			<Button look="primary" size="xlarge" iconBefore={StarIcon} block />
		</GEL>
	);
}

export default Example;
