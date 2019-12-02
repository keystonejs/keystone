/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { useReducer } from 'react';
import { Modal, Header, Body, Footer } from '@westpac/modal';
import { Button } from '@westpac/button';

function Example({ brand }) {
	const initialState = { default: { open: false }, small: { open: false }, large: { open: false } };

	const modalReducer = (state, action) => {
		switch (action.type) {
			case 'default':
				return { ...state, default: { open: action.payload.open } };
			case 'small':
				return { ...state, small: { open: action.payload.open } };
			case 'large':
				return { ...state, large: { open: action.payload.open } };
			default:
				throw new Error();
		}
	};

	const [state, dispatch] = useReducer(modalReducer, initialState);

	const updateModal = (type, open) => dispatch({ type, payload: { open } });

	return (
		<GEL brand={brand}>
			<p>
				<Button onClick={() => updateModal('default', true)}>Open default modal</Button>
			</p>
			<Modal open={state.default.open} onClose={() => updateModal('default', false)}>
				<Header>Modal Title</Header>
				<Body>
					‘It was much pleasanter at home’, thought poor Alice, ‘when one wasn’t always growing
					larger and smaller, and being ordered about by mice and rabbits. I almost wish I hadn’t
					gone down that rabbit-hole — and yet — and yet — it’s rather curious, you know, this sort
					of life! I do wonder what can have happened to me! When I used to read fairy-tales, I
					fancied that kind of thing never happened, and now here I am in the middle of one! There
					ought to be a book written about me, that there ought!’
				</Body>
				<Footer>
					<Button appearance="faint" onClick={() => updateModal('default', false)}>
						Close
					</Button>
				</Footer>
			</Modal>

			<p>
				<Button onClick={() => updateModal('small', true)}>Open small modal</Button>
			</p>
			<Modal open={state.small.open} onClose={() => updateModal('small', false)} size="small">
				<Header>Modal Title Modal Title Modal Title Modal Title Modal Title Modal Title</Header>
				<Body>
					‘It was much pleasanter at home’, thought poor Alice, ‘when one wasn’t always growing
					larger and smaller, and being ordered about by mice and rabbits. I almost wish I hadn’t
					gone down that rabbit-hole — and yet — and yet — it’s rather curious, you know, this sort
					of life! I do wonder what can have happened to me! When I used to read fairy-tales, I
					fancied that kind of thing never happened, and now here I am in the middle of one! There
					ought to be a book written about me, that there ought!’ ‘It was much pleasanter at home’,
					thought poor Alice, ‘when one wasn’t always growing larger and smaller, and being ordered
					about by mice and rabbits. I almost wish I hadn’t gone down that rabbit-hole — and yet —
					and yet — it’s rather curious, you know, this sort of life! I do wonder what can have
					happened to me! When I used to read fairy-tales, I fancied that kind of thing never
					happened, and now here I am in the middle of one! There ought to be a book written about
					me, that there ought!’ ‘It was much pleasanter at home’, thought poor Alice, ‘when one
					wasn’t always growing larger and smaller, and being ordered about by mice and rabbits. I
					almost wish I hadn’t gone down that rabbit-hole — and yet — and yet — it’s rather curious,
					you know, this sort of life! I do wonder what can have happened to me! When I used to read
					fairy-tales, I fancied that kind of thing never happened, and now here I am in the middle
					of one! There ought to be a book written about me, that there ought!’
				</Body>
				<Footer>
					<Button appearance="faint" onClick={() => updateModal('small', false)}>
						Close
					</Button>
				</Footer>
			</Modal>

			<p>
				<Button onClick={() => updateModal('large', true)}>Open large modal</Button>
			</p>
			<Modal open={state.large.open} onClose={() => updateModal('large', false)} size="large">
				<Header>Modal Title</Header>
				<Body>
					‘It was much pleasanter at home’, thought poor Alice, ‘when one wasn’t always growing
					larger and smaller, and being ordered about by mice and rabbits. I almost wish I hadn’t
					gone down that rabbit-hole — and yet — and yet — it’s rather curious, you know, this sort
					of life! I do wonder what can have happened to me! When I used to read fairy-tales, I
					fancied that kind of thing never happened, and now here I am in the middle of one! There
					ought to be a book written about me, that there ought!’
				</Body>
				<Footer>
					<Button appearance="faint" onClick={() => updateModal('large', false)}>
						Close
					</Button>
				</Footer>
			</Modal>
		</GEL>
	);
}

export default Example;
