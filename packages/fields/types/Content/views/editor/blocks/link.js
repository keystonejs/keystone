/** @jsx jsx */
import { jsx } from '@emotion/core';
import TooltipTrigger from 'react-popper-tooltip';

export function renderNode({ node, attributes, children }) {
	let { data } = node;
	const href = data.get('href');
	return (
		<TooltipTrigger
			placement="bottom"
			delayHide={200}
			tooltip={({ getTooltipProps, tooltipRef }) => (
				<div
					{...getTooltipProps({
						ref: tooltipRef,
					})}
					css={{ backgroundColor: 'black', padding: 8 }}
				>
					<a css={{ color: 'white' }} contentEditable={false} href={href}>
						{href}
					</a>
					{/* TODO: edit button */}
				</div>
			)}
		>
			{({ getTriggerProps, triggerRef }) => (
				<a
					{...getTriggerProps({ ref: triggerRef })}
					{...attributes}
					css={{ color: 'blue', ':visited': { color: 'purple' } }}
					href={href}
				>
					{children}
				</a>
			)}
		</TooltipTrigger>
	);
}
