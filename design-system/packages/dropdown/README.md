# Dropdown

Dropdown menu should be used when additional options are available to the user
and there is a space constraint.

## Usage

### Basic

The text within a dropdown menu should be direct so users can quickly decide on an action.

```jsx live
<DropdownMenu trigger="Trigger">
  <MenuItem label="First" onClick={() => alert('First selected')} />
  <MenuItem label="Second" onClick={() => alert('Second selected')} />
  <MenuItem label="Third" onClick={() => alert('Third selected')} />
</DropdownMenu>
```

### Tones

Provide a `tone` to help convey the implication of an item's action. Actions
that could cause a significant change to the user’s data (remove employee,
delete pay run, etc.) should use the `critical` tone.

```jsx live
<DropdownMenu trigger="Trigger">
  <MenuItem tone="passive" label="Passive (default)" />
  <MenuItem tone="active" label="Active" />
  <MenuItem tone="critical" label="Critical" />
</DropdownMenu>
```

### Icons

Provide an `icon` if it will help clarify the intent of the item's action.

```jsx live
<DropdownMenu trigger="Trigger">
  <MenuItem icon={FlagIcon} tone="passive" label="Passive with icon" />
  <MenuItem icon={Edit3Icon} tone="active" label="Active with icon" />
  <MenuItem icon={Trash2Icon} tone="critical" label="Critical with icon" />
</DropdownMenu>
```

### Menu Alignment

We recommend aligning the menu "right" when the trigger is right-aligned within
its container.

```jsx live
<Flex justify="between">
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
</Flex>
```

### Groups and Dividers

Use groups and dividers to separate items into appropriate sections.

```jsx live
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
```

### Disabled

Menu items can be disabled with a `disabled` prop.

```jsx live
<DropdownMenu trigger="Trigger">
  <MenuItem label="First" onClick={() => alert('First selected')} />
  <MenuItem disabled label="Second" onClick={() => alert('Second selected')} />
</DropdownMenu>
```

### Item Overflow

When there are many items in a dropdown menu it will grow to a maximum height
and the overflowing items will be scrollable.

Long labels will be truncated to avoid blowing out the menu width.

```jsx live
<Cluster gap="large">
  <DropdownMenu trigger="Scrolling">
    {Array.from({ length: 20 }, (_, i) => (
      <MenuItem key={i} label={`Item ${i + 1}`} />
    ))}
  </DropdownMenu>
  <DropdownMenu trigger="Truncated Label">
    <MenuItem label="Very long labels will be truncated when the max width is met" />
  </DropdownMenu>
</Cluster>
```

### Custom Trigger

The `trigger` prop also accepts a function to render a custom trigger element.

```jsx live
<DropdownMenu
  trigger={({ triggerProps }) => (
    <IconButton weight="subtle" icon={MoreHorizontalIcon} {...triggerProps} />
  )}
>
  <MenuItem label="First" />
  <MenuItem label="Second" />
  <MenuItem label="Third" />
</DropdownMenu>
```
