/** @jsx jsx */

import React from 'react';
import { jsx } from '@westpac/core';
import { useModalContext } from './Modal';

export const ModalBody = props => {
	const { bodyId } = useModalContext();
	return <div id={bodyId} css={{ padding: '1.125rem 1.5rem' }} {...props} />;
};
