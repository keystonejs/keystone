import { useEffect } from 'react';

export const useOutsideClick = (ref, callback) => {
	const handleOutsideClick = e => {
		if (ref.current && !ref.current.contains(e.target)) {
			callback();
		}
	};
	useEffect(() => {
		document.addEventListener('click', handleOutsideClick);
		return () => {
			document.removeEventListener('click', handleOutsideClick);
		};
	});
};
