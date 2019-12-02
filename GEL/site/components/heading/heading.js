/** @jsx jsx */
import { jsx } from '@emotion/core';

const stylesMap = {
	1: { fontSize: 34 },
	2: { fontSize: 31 },
};
const Heading = ({ tag: Tag = 'h2', size = 2, ...props }) => (
	<Tag css={stylesMap[size]} {...props} />
);

export default Heading;
