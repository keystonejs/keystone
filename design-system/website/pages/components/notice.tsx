/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx } from '@keystone-ui/core';
import { Notice, noticeToneValues } from '@keystone-ui/notice';

import { Page } from '../../components/Page';
import { toLabel, aAn } from '../../utils';

export default function ButtonPage() {
  const actions = {
    primary: { label: 'Primary Action', onPress: () => undefined },
    secondary: { label: 'Secondary Action', onPress: () => undefined },
  };
  return (
    <Page>
      <h1>Notice</h1>
      <h2>Tone</h2>
      <p>Tone changes the color of the notice, and its icon</p>
      <div css={{ maxWidth: 860 }}>
        {noticeToneValues.map(tone => (
          <Notice
            title={toLabel(tone)}
            key={tone}
            tone={tone}
            css={{ marginBottom: 20 }}
            actions={actions}
          >
            I am {aAn(tone)} {tone} notice
          </Notice>
        ))}
      </div>
    </Page>
  );
}
