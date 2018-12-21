import React from 'react';
import isHotkey from 'is-hotkey';

function markPlugin(type, options) {
	return {
		onKeyDown(event, editor, next) {
			// If it doesn't match our `key`, let other plugins handle it.
			if (!options.test(event)) return next();
			// Prevent the default characters from being inserted.
			event.preventDefault();
			// Toggle the mark `type`.
			editor.toggleMark(type);
		},
		renderMark: (props, editor, next) => {
			if (props.mark.type === type) {
				return options.render(props);
			}
			return next();
		},
	};
}

export let marks = {
	bold: {
		test: isHotkey('mod+b'),
		render: props => <strong {...props.attributes}>{props.children}</strong>,
	},
	italic: {
		test: isHotkey('mod+i'),
		render: props => <em {...props.attributes}>{props.children}</em>,
	},
	strikethrough: {
		test: isHotkey('mod+~'),
		render: props => <s {...props.attributes}>{props.children}</s>,
	},
	underline: {
		test: isHotkey('mod+u'),
		render: props => <u {...props.attributes}>{props.children}</u>,
	},
};

export let markTypes = Object.keys(marks);

export let plugins = Object.entries(marks).map(([type, options]) => {
	return markPlugin(type, options);
});
