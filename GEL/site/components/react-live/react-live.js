/** @jsx jsx */
import { jsx, useBrand } from '@westpac/core';

import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live';

const ReactLive = ({
	code = `<p>Add your own code in a "code" prop on the "ReactLive" component!</p>`,
	scope = {},
}) => {
	const { COLORS } = useBrand();
	return (
		<LiveProvider code={code} scope={scope}>
			<LivePreview />
			<div>
				<LiveError
					css={{
						backgroundColor: COLORS.background,
						color: COLORS.warning,
						padding: 20,
						wordWrap: 'break-word',
						whiteSpace: 'pre-wrap',
						borderRadius: 4,
						maxWidth: '100%',
					}}
				/>
			</div>
			<LiveEditor
				css={{
					background: '#3b3b3b',
					padding: 40,
					fontSize: 16,
					borderRadius: 4,
					marginBottom: 40,
				}}
			/>
		</LiveProvider>
	);
};

export default ReactLive;
