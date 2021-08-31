/** @jsxRuntime classic */
/** @jsx jsx */

import { jsx, Stack } from '@keystone-ui/core';
import { Button, buttonToneValues, ToneKey, buttonWeightValues } from '@keystone-ui/button';

import { Page } from '../../components/Page';
import { toLabel } from '../../utils';

const Variants = ({ tone }: { tone: ToneKey }) => {
  const toneLabel = toLabel(tone);
  return (
    <div>
      <h3>{toneLabel} Tone</h3>
      <Stack across gap="medium" align="center">
        {buttonWeightValues.map(weight => {
          const weightLabel = toLabel(weight);
          return (
            <Button tone={tone} weight={weight} key={weight}>
              {toneLabel} {weightLabel}
            </Button>
          );
        })}
      </Stack>
    </div>
  );
};

export default function ButtonPage() {
  return (
    <Page>
      <h1>Button</h1>
      <h2>Tone &amp; Weight</h2>
      <p>
        Tone changes the color of the button, while the weight changes how prominent the button
        appears
      </p>
      {buttonToneValues.map(tone => (
        <Variants tone={tone} key={tone} />
      ))}
      <h2>Size</h2>
      <p>Changes the size of the button</p>
      <Stack across gap="medium" align="center">
        <Button tone="active" weight="bold" size="large">
          Large
        </Button>
        <Button tone="active" weight="bold" size="medium">
          Medium
        </Button>
        <Button tone="active" weight="bold" size="small">
          Small
        </Button>
      </Stack>
      <h2>Loading</h2>
      <Stack across gap="medium" align="center">
        <Button weight="bold" tone="active" size="large" isLoading>
          Is Loading
        </Button>
        <Button weight="bold" tone="active" size="medium" isLoading>
          Is Loading
        </Button>
        <Button weight="bold" tone="active" size="small" isLoading>
          Is Loading
        </Button>
      </Stack>
      <h2>Disabled</h2>
      <p>Causes the button to be disabled. It won't respond to click or keyboard events.</p>
      <Stack across gap="medium" align="center">
        <Button weight="bold" tone="active" isDisabled>
          Disabled
        </Button>
        <Button weight="light" tone="active" isDisabled>
          Disabled
        </Button>
        <Button weight="none" tone="active" isDisabled>
          Disabled
        </Button>
        <Button weight="bold" tone="passive" isDisabled>
          Disabled
        </Button>
        <Button weight="light" tone="passive" isDisabled>
          Disabled
        </Button>
        <Button weight="none" tone="passive" isDisabled>
          Disabled
        </Button>
        <Button weight="bold" tone="negative" isDisabled>
          Disabled
        </Button>
        <Button weight="light" tone="negative" isDisabled>
          Disabled
        </Button>
        <Button weight="none" tone="negative" isDisabled>
          Disabled
        </Button>
      </Stack>
    </Page>
  );
}
