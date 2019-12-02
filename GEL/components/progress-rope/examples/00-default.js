/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Grid, Cell } from '@westpac/grid';
import { Button } from '@westpac/button';
import { ProgressRope, Item } from '@westpac/progress-rope';
import { useProgress, Link } from './_utils';

function Example({ brand }) {
	const [state, dispatch] = useProgress();

	return (
		<GEL brand={brand}>
			<Grid>
				<Cell width={4}>
					<ProgressRope current={state.index}>
						{[...Array(5)].map((val, i) => (
							<Item key={i}>
								<Link index={i} dispatch={dispatch}>
									Step {i}
								</Link>
							</Item>
						))}
						<Item review>
							<a href="#">Review and Submit</a>
						</Item>
					</ProgressRope>
				</Cell>
				<Cell width={4}>
					<Button onClick={() => dispatch({ type: 'prev' })}>prev</Button>{' '}
					<Button onClick={() => dispatch({ type: 'next' })}>next</Button>
				</Cell>
				<Cell width={4}>
					<h3>current: {state.index}</h3>
				</Cell>
			</Grid>
		</GEL>
	);
}

export default Example;
