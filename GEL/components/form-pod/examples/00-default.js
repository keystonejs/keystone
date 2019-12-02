/** @jsx jsx */

import { GEL, jsx, Global, useBrand } from '@westpac/core';
import {
	FormPod,
	FormPodActions,
	FormPodContactList,
	FormPodIndicator,
	FormPodPanel,
	FormPodPanelBody,
	FormPodPanelFooter,
} from '@westpac/form-pod';
import { HeadsetIcon, LiveChatIcon } from '@westpac/icon';
import { Button } from '@westpac/button';
import { Fragment } from 'react';

function Example({ brand }) {
	const { COLORS } = useBrand();

	// Contact detail data
	const contactItems = [
		{
			icon: HeadsetIcon,
			// iconColor: COLORS.muted,
			text: '1300 888 888',
			url: 'tel:1300888888',
			onClick: () => {},
		},
		// {
		// 	icon: LiveChatIcon,
		// 	iconColor: COLORS.muted,
		// 	text: 'LiveChat',
		// 	url: '#0',
		// 	onClick: () => {},
		// },
	];

	return (
		<GEL brand={brand}>
			<Global
				styles={{
					// Lets apply a background to simulate being inside the Template component
					body: {
						backgroundColor: COLORS.background,
					},
				}}
			/>

			<FormPod preheading="Preheading" heading="Heading">
				<FormPodPanel>
					<FormPodPanelBody>[PANEL CONTENT]</FormPodPanelBody>
					<FormPodPanelFooter
						left={<FormPodContactList items={contactItems} />}
						right={<FormPodIndicator />}
					/>
				</FormPodPanel>
				<FormPodActions
					primary={
						<Fragment>
							<Button appearance="primary" soft size="large" block={[true, false]}>
								Back
							</Button>
							<Button appearance="primary" size="large" block={[true, false]}>
								Next
							</Button>
						</Fragment>
					}
					secondary={
						<Button appearance="faint" soft size="large" block={[true, false]}>
							Cancel
						</Button>
					}
				/>
			</FormPod>
		</GEL>
	);
}

export default Example;
