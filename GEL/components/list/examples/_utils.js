import React from 'react';
import { Item } from '../src/Item';

export const listGenerator = (text, num) => {
	let list = [];

	for (let i = 0; i < num; i++) {
		list.push(<Item key={Math.round((i + 10000) * Math.random())}>{text}</Item>);
	}
	return list;
};
