import React, { useReducer } from 'react';

export const useProgress = () => {
	const initialState = { index: 0 };

	const progressReducer = (state, action) => {
		switch (action.type) {
			case 'next':
				return { index: state.index + 1 };
			case 'prev':
				return { index: state.index - 1 };
			case 'goto':
				return { index: action.index };
			default:
				throw new Error();
		}
	};

	const [state, dispatch] = useReducer(progressReducer, initialState);
	return [state, dispatch];
};

export const Link = ({ index, dispatch, ...props }) => (
	<a
		href="#"
		onClick={e => {
			e.preventDefault();
			dispatch({ type: 'goto', index });
		}}
		{...props}
	/>
);
