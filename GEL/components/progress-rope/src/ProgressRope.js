/** @jsx jsx */

import {
	Children,
	cloneElement,
	createContext,
	useReducer,
	useState,
	useEffect,
	useContext,
} from 'react';
import PropTypes from 'prop-types';
import { jsx } from '@westpac/core';
import { ProgressRopeGroup } from './ProgressRopeGroup';

// ==============================
// Context and Consumer Hook
// ==============================
const ProgressRopeContext = createContext();

export const useProgressRopeContext = () => {
	const context = useContext(ProgressRopeContext);

	if (!context) {
		throw new Error('ProgressRope sub-components should be wrapped in a <ProgressRope>.');
	}

	return context;
};

// ==============================
// Utils
// ==============================
const createRopeGraph = children => {
	const ropeGraph = [];
	let grouped = false;
	Children.forEach(children, (child, i) => {
		if (child.type === ProgressRopeGroup) {
			grouped = true;
			ropeGraph.push(Array(Children.count(child.props.children)).fill('unvisited'));
		} else {
			ropeGraph.push(['unvisited']);
		}
	});
	return { ropeGraph, grouped };
};

// ==============================
// Component
// ==============================
export const ProgressRope = ({ current, children, ...props }) => {
	const initialState = {
		currStep: current,
		currGroup: 0,
		openGroup: 0,
		...createRopeGraph(children),
	};

	const progressReducer = (state, action) => {
		switch (action.type) {
			case 'UPDATE_STEP':
				return { ...state, currStep: action.payload };
			case 'UPDATE_GROUP':
				return { ...state, currGroup: action.payload };
			case 'UPDATE_OPEN_GROUP':
				return { ...state, openGroup: action.payload };
			case 'UPDATE_GROUPED':
				return { ...state, grouped: action.payload };
			case 'UPDATE_GRAPH':
				return { ...state, ropeGraph: action.payload };
			default:
				return state;
		}
	};

	const [state, dispatch] = useReducer(progressReducer, initialState);

	useEffect(() => {
		let itemCount = 0;
		const updatedGraph = state.ropeGraph.map(group => [...group]); // deep copy

		if (state.grouped) {
			state.ropeGraph.forEach((group, i) => {
				if (current >= itemCount) {
					itemCount += group.length;
					if (current < itemCount) {
						// current index is in here
						const pos = group.length - (itemCount - current);
						updatedGraph[i][pos] = 'visited';
						dispatch({ type: 'UPDATE_GRAPH', payload: updatedGraph });
						dispatch({ type: 'UPDATE_STEP', payload: pos });
						dispatch({ type: 'UPDATE_GROUP', payload: i });
						dispatch({ type: 'UPDATE_OPEN_GROUP', payload: i });
					}
				}
			});
		} else {
			if (current < updatedGraph.length && current >= 0) updatedGraph[current][0] = 'visited';
			dispatch({ type: 'UPDATE_STEP', payload: current });
			dispatch({ type: 'UPDATE_GRAPH', payload: updatedGraph });
		}
	}, [current]);

	const handleClick = index => {
		dispatch({ type: 'UPDATE_OPEN_GROUP', payload: index !== state.openGroup ? index : null });
	};

	return (
		<ProgressRopeContext.Provider value={{ ...state, handleClick }}>
			<ol css={{ position: 'relative', listStyle: 'none', paddingLeft: 0, margin: 0 }} {...props}>
				{Children.map(children, (child, i) => cloneElement(child, { index: i }))}
			</ol>
		</ProgressRopeContext.Provider>
	);
};

// ==============================
// Types
// ==============================
ProgressRope.propTypes = {
	current: PropTypes.number,
};

ProgressRope.defaultProps = {
	current: 0,
};
