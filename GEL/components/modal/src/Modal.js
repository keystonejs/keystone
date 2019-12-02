/** @jsx jsx */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { jsx } from '@westpac/core';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import shortid from 'shortid';
import FocusLock from 'react-focus-lock';
import { CSSTransition } from 'react-transition-group';
import { Backdrop, StyledModal } from './styled';

// ==============================
// Context and Consumer Hook
// ==============================
const ModalContext = createContext();

export const useModalContext = () => {
	const context = useContext(ModalContext);

	if (!context) {
		throw new Error('Modal sub-components should be wrapped in a <Modal>.');
	}

	return context;
};

// ==============================
// Component
// ==============================
export const Modal = ({ open: isOpen, onClose, size, children, ...props }) => {
	const [open, setOpen] = useState(isOpen);

	useEffect(() => {
		setOpen(isOpen);
	}, [isOpen]);

	const handleClose = () => {
		if (onClose) {
			onClose();
		} else {
			setOpen(false);
		}
	};

	const modalId = shortid.generate();
	const titleId = `modal-header-title-${modalId}`;
	const bodyId = `modal-body-${modalId}`;

	// on escape close modal
	const keyHandler = event => {
		if (event.keyCode === 27) handleClose();
	};

	// bind key events
	useEffect(() => {
		window.document.addEventListener('keydown', keyHandler);
		return () => {
			window.document.removeEventListener('keydown', keyHandler);
		};
	});

	const handleBackdropClick = e => {
		if (e.target === e.currentTarget) {
			handleClose();
		}
	};

	return ReactDOM.createPortal(
		<CSSTransition mountOnEnter unmountOnExit in={open} timeout={300} classNames="modal-backdrop">
			<Backdrop onClick={handleBackdropClick}>
				<FocusLock returnFocus autoFocus={false}>
					<CSSTransition appear in={open} timeout={100} classNames="modal">
						<ModalContext.Provider value={{ titleId, bodyId, handleClose }}>
							<StyledModal
								role="dialog"
								aria-modal="true"
								aria-labelledby={titleId}
								aria-describedby={bodyId}
								tabIndex="-1"
								size={size}
								{...props}
							>
								{children}
							</StyledModal>
						</ModalContext.Provider>
					</CSSTransition>
				</FocusLock>
			</Backdrop>
		</CSSTransition>,
		document.body
	);
};

// ==============================
// Types
// ==============================

Modal.propTypes = {
	/** State of whether the modal is open */
	open: PropTypes.bool,
	/** Callback function for handling modal state */
	onClose: PropTypes.func,
	/** Size of the modal */
	size: PropTypes.oneOf(['small', 'medium', 'large']),
};

Modal.defaultProps = {
	open: false,
	size: 'medium',
};
