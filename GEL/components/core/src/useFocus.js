export const useFocus = () => {
	if (typeof window !== 'undefined' && window.document && window.document.createElement) {
		// Let's make sure we only add the script once
		const hasScript = document.querySelectorAll('script[id="GELFocus"]').length > 0;

		if (!hasScript) {
			// Insert a script that:
			// - adds the "isMouseMode" class to the body
			// - listens for the tab key
			// - when tab key is pressed removes the "isMouseMode" class and removes the listener
			const scriptEl = document.createElement('script');
			scriptEl.setAttribute('id', 'GELFocus');
			scriptEl.text = `
				function GELKeyHandler( event ) {
					if( event.key === 'Tab' ) {
						document.getElementsByTagName('body')[ 0 ].classList.remove('isMouseMode');
						document.removeEventListener('keydown', GELKeyHandler);
					}
				};

				document.getElementsByTagName('body')[ 0 ].classList.add('isMouseMode');
				window.document.addEventListener('keydown', GELKeyHandler);
			`;
			document.body.insertBefore(scriptEl, document.body.firstChild);

			// Insert CSS style to hide all focus only when the "isMouseMode" is present
			const styleEl = document.createElement('style');
			styleEl.setAttribute('type', 'text/css');
			styleEl.innerHTML = `
				.isMouseMode :focus {
					outline: 0 !important;
				}
			`;
			document.head.appendChild(styleEl);
		}
	}
};
