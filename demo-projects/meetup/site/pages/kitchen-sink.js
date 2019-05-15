/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Button } from '../primitives';
import { colors, gridSize } from '../theme';
export default function Page() {
  return (
    <div css={{ padding: gridSize * 2 }}>
      <Button background={colors.yellow} foreground={colors.greyDark}>
        Click me
      </Button>
      <Button background={colors.purple} foreground="white">
        Click me
      </Button>
      <Button background={colors.red}>Click me</Button>
      <Button outline background={colors.red}>
        Outline
      </Button>
      <Button>Click me</Button>
    </div>
  );
}
