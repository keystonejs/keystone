export const wrapHandlers = (consumerHandler, ourHandler) => event => {
	if (typeof consumerHandler === 'function') {
		consumerHandler(event);
	}

	if (!event.defaultPrevented) {
		ourHandler(event);
	}
};
