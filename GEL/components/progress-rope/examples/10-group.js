/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { Grid, Cell } from '@westpac/grid';
import { Button } from '@westpac/button';
import { ProgressRope, Group, Item } from '@westpac/progress-rope';
import { useProgress, Link } from './_utils';

function Example({ brand }) {
	const [state, dispatch] = useProgress();

	return (
		<GEL brand={brand}>
			<Grid>
				<Cell width={4}>
					<ProgressRope current={state.index}>
						<Group label={'Group 1'}>
							<Item>
								<Link index={0} dispatch={dispatch}>
									Step 0
								</Link>
							</Item>
							<Item>
								<Link index={1} dispatch={dispatch}>
									Step 1
								</Link>
							</Item>
						</Group>
						<Group label={'Group 2'}>
							<Item>
								<Link index={2} dispatch={dispatch}>
									Step 2
								</Link>
							</Item>
							<Item>
								<Link index={3} dispatch={dispatch}>
									Step 3
								</Link>
							</Item>
						</Group>
						<Group label={'Group 3'}>
							<Item>
								<Link index={4} dispatch={dispatch}>
									Step 4
								</Link>
							</Item>
							<Item>
								<Link index={5} dispatch={dispatch}>
									Step 5
								</Link>
							</Item>
							<Item>
								<Link index={6} dispatch={dispatch}>
									Step 6
								</Link>
							</Item>
						</Group>
						<Item review>
							<Link index={7} dispatch={dispatch}>
								Review and Submit
							</Link>
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
