/** @jsx jsx */

import { GEL, jsx } from '@westpac/core';
import { ListGroup, Item } from '@westpac/list-group';
import { ButtonGroup, Button } from '@westpac/button';

const styleExample = {
	marginLeft: '0.75rem',
};

function Example({ brand }) {
	return (
		<GEL brand={brand}>
			<ListGroup>
				<Item>
					Send me sms reminders
					<ButtonGroup size="small" name="example-default-1" css={styleExample}>
						<Button value="yes">Yes</Button>
						<Button value="no">No</Button>
					</ButtonGroup>
				</Item>
				<Item>
					Give me free money
					<ButtonGroup size="small" name="example-default-2" css={styleExample}>
						<Button value="yes">Yes</Button>
						<Button value="no">No</Button>
					</ButtonGroup>
				</Item>
				<Item>
					Call me all the time
					<ButtonGroup size="small" name="example-default-3" css={styleExample}>
						<Button value="yes">Yes</Button>
						<Button value="no">No</Button>
					</ButtonGroup>
				</Item>
				<Item>
					Deleted messages
					<ButtonGroup size="small" name="example-default-4" css={styleExample}>
						<Button value="yes">Yes</Button>
						<Button value="no">No</Button>
					</ButtonGroup>
				</Item>
			</ListGroup>
		</GEL>
	);
}

export default Example;
