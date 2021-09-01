/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, Text, Stack } from '@keystone-ui/core';

import { Page } from '../../components/Page';
import { Code } from '../../components/Code';

export default function ThemePage() {
  return (
    <Page>
      <h1>Stack</h1>
      <p>
        Flow elements require space (sometimes referred to as "white space") to physically and
        conceptually separate them from the elements that come before and after them.
      </p>
      <h2>Usage</h2>
      <h3>Gap</h3>
      <p>
        The gap property defines how much space there should be between each element in the stack.
        Available gap sizes are:{' '}
        <ul>
          <li>
            <Code>none</Code> (default)
          </li>
          <li>
            <Code>xsmall</Code>
          </li>
          <li>
            <Code>small</Code>
          </li>
          <li>
            <Code>medium</Code>
          </li>
          <li>
            <Code>large</Code>
          </li>
          <li>
            <Code>xlarge</Code>
          </li>
          <li>
            <Code>xxlarge</Code>
          </li>
        </ul>
      </p>
      <Stack gap="small">
        <div style={{ background: '#eee', height: 32 }} />
        <div style={{ background: '#eee', height: 32 }} />
        <div style={{ background: '#eee', height: 32 }} />
      </Stack>
      <h3>Align</h3>
      <p>
        Align items along the cross-axis of the flex container:
        <ul>
          <li>
            <Code>center</Code>
          </li>
          <li>
            <Code>end</Code>
          </li>
          <li>
            <Code>start</Code>
          </li>
          <li>
            <Code>stretch</Code>(default)
          </li>
        </ul>
      </p>
      <Stack gap="small" align="center">
        <div style={{ background: '#eee', height: 32, width: 32 }} />
        <div style={{ background: '#eee', height: 32, width: 128 }} />
        <div style={{ background: '#eee', height: 32, width: 32 }} />
      </Stack>
      <h3>Orientation</h3>
      <p>
        Stacks can also be distributed along the horizontal axis by passing the <Code>across</Code>{' '}
        prop.
      </p>
      <p>
        <strong>Note:</strong> items within a horizontally oriented <Code>Stack</Code> will not
        wrap. If you need items to wrap, consider using the <Code>Wrap</Code> layout primitive.
      </p>
      <Stack gap="small" across>
        <div style={{ background: '#eee', padding: 16 }} />
        <div style={{ background: '#eee', padding: 16 }} />
        <div style={{ background: '#eee', padding: 16 }} />
      </Stack>
      <h3>Dividers</h3>
      <p>
        Use the dividers property to separate each element in the stack with a divider. Available
        divider options are:
        <ul>
          <li>
            <Code>none</Code> (default)
          </li>
          <li>
            <Code>between</Code>
          </li>
          <li>
            <Code>around</Code>
          </li>
          <li>
            <Code>start</Code>
          </li>
          <li>
            <Code>end</Code>
          </li>
        </ul>
      </p>
      <Stack gap="small" dividers="between">
        <Text>First item</Text>
        <Text>Second item</Text>
        <Text>Third item</Text>
      </Stack>
      <h3>Nesting</h3>
      <p>You can nest stacks however you like to achieve the desired layout.</p>
      <Stack gap="xlarge">
        <Stack gap="xsmall">
          <div style={{ background: '#eee', height: 32 }} />
          <div style={{ background: '#eee', height: 32 }} />
          <div style={{ background: '#eee', height: 32 }} />
        </Stack>
        <Stack gap="xsmall">
          <div style={{ background: '#eee', height: 32 }} />
          <div style={{ background: '#eee', height: 32 }} />
          <div style={{ background: '#eee', height: 32 }} />
        </Stack>
        <Stack gap="xsmall">
          <div style={{ background: '#eee', height: 32 }} />
          <div style={{ background: '#eee', height: 32 }} />
          <div style={{ background: '#eee', height: 32 }} />
        </Stack>
      </Stack>
    </Page>
  );
}
