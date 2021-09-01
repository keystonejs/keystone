/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { Button } from '@keystone-ui/button';
import { Tooltip } from '@keystone-ui/tooltip';
import { Page } from '../../components/Page';

export default function PopoverPage() {
  return (
    <Page>
      <p>
        Tooltips are meant to be used for supplemental content and should never be used for critical
        information the user needs to complete a task. Tooltips may not contain interactive elements
        (such as buttons or links).
      </p>
      <Tooltip content="You cannot save changes because no changes have been made">
        {props => <Button {...props}>Save changes</Button>}
      </Tooltip>
    </Page>
  );
}
