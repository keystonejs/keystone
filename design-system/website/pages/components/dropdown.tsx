/** @jsx jsx */

import { Stack, jsx, Inline } from '@keystone-ui/core';
import { DropdownMenu, MenuItem, MenuGroup, MenuDivider } from '@keystone-ui/dropdown';
import { IconButton } from '@keystone-ui/button';
import { FlagIcon } from '@keystone-ui/icons/icons/FlagIcon';
import { Edit3Icon } from '@keystone-ui/icons/icons/Edit3Icon';
import { Trash2Icon } from '@keystone-ui/icons/icons/Trash2Icon';
import { MoreHorizontalIcon } from '@keystone-ui/icons/icons/MoreHorizontalIcon';

import { Page } from '../../components/Page';

const Basic = () => (
  <DropdownMenu trigger="Trigger">
    <MenuItem label="First" onClick={() => alert('First selected')} />
    <MenuItem label="Second" onClick={() => alert('Second selected')} />
    <MenuItem label="Third" onClick={() => alert('Third selected')} />
  </DropdownMenu>
)

const Tones = () => (
  <DropdownMenu trigger="Trigger">
    <MenuItem tone="passive" label="Passive (default)" />
    <MenuItem tone="active" label="Active" />
    <MenuItem tone="negative" label="Negative" />
  </DropdownMenu>
);

const Icons = () => (
  <DropdownMenu trigger="Trigger">
    <MenuItem icon={FlagIcon} tone="passive" label="Passive with icon" />
    <MenuItem icon={Edit3Icon} tone="active" label="Active with icon" />
    <MenuItem icon={Trash2Icon} tone="negative" label="Negative with icon" />
  </DropdownMenu>
);

const MenuAlignment = () => (
  <Inline gap="xxlarge">
    <DropdownMenu trigger="Left aligned (default)" align="left">
      <MenuItem label="First" />
      <MenuItem label="Second" />
      <MenuItem label="Third" />
    </DropdownMenu>
    <DropdownMenu trigger="Right aligned" align="right">
      <MenuItem label="First" />
      <MenuItem label="Second" />
      <MenuItem label="Third" />
    </DropdownMenu>
  </Inline>
);

const GroupsAndDividers = () => (
  <DropdownMenu trigger="Trigger">
    <MenuGroup title="First group">
      <MenuItem label="First item" />
      <MenuItem label="Second item" />
    </MenuGroup>
    <MenuDivider />
    <MenuGroup title="Second group">
      <MenuItem label="Third item" />
      <MenuItem label="Fourth item" />
    </MenuGroup>
    <MenuDivider />
    <MenuItem label="Outside of groups" />
  </DropdownMenu>
);

const Disabled = () => (
  <DropdownMenu trigger="Trigger">
    <MenuItem label="First" onClick={() => alert('First selected')} />
    <MenuItem
      isDisabled
      label="Second"
      onClick={() => alert('Second selected')}
    />
  </DropdownMenu>
);

const ItemOverflow = () => (
  <Inline gap="large">
    <DropdownMenu trigger="Scrolling">
      {Array.from({ length: 20 }, (_, i) => (
        <MenuItem key={i} label={`Item ${i + 1}`} />
      ))}
    </DropdownMenu>
    <DropdownMenu trigger="Truncated Label">
      <MenuItem label="Very long labels will be truncated when the max width is met" />
    </DropdownMenu>
  </Inline>
);

const TriggerRenderer = () => (
  <DropdownMenu
    trigger={({ triggerProps }) => (
      <IconButton
        label="Show more"
        weight="light"
        icon={MoreHorizontalIcon}
        {...triggerProps}
      />
    )}
  >
    <MenuItem label="First" />
    <MenuItem label="Second" />
    <MenuItem label="Third" />
  </DropdownMenu>
);


export default function DropdownButtonPage() {
  return (
    <Page>
      <h1>Dropdown</h1>
      <Stack across gap="xxlarge">
        <div>
          <h2>Basic</h2>
          <Stack gap="small">
            <Basic />
          </Stack>
        </div>
        <div>
          <h2>Tones</h2>
          <Stack gap="small">
            <Tones />
          </Stack>
        </div>
        <div>
          <h2>Icons</h2>
          <Stack gap="small">
            <Icons />
          </Stack>
        </div>

        <div>
          <h2>Groups and Dividers</h2>
          <Stack gap="small">
            <GroupsAndDividers />
          </Stack>
        </div>
        <div>
          <h2>Disabled</h2>
          <Stack gap="small">
            <Disabled />
          </Stack>
        </div>

        <div>
          <h2>Trigger Renderer</h2>
          <Stack gap="small">
            <TriggerRenderer />
          </Stack>
        </div>
      </Stack>
      <Stack across gap="xxlarge">
        <div>
          <h2>Menu Alignment</h2>
          <Stack gap="small">
            <MenuAlignment />
          </Stack>
        </div>
      </Stack>
      <Stack across gap="xxlarge">
        <div>
          <h2>Item Overflow</h2>
          <Stack gap="small">
            <ItemOverflow />
          </Stack>
        </div>
      </Stack>
    </Page>
  );
}

