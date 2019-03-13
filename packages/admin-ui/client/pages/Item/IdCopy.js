/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useCallback, memo, useState, useEffect } from 'react';

import CopyToClipboard from '../../components/CopyToClipboard';
import Animation from '../../components/Animation';
import { CheckIcon, ClippyIcon } from '@arch-ui/icons';
import { FlexGroup } from '@arch-ui/layout';
import { A11yText } from '@arch-ui/typography';
import { colors } from '@arch-ui/theme';
import { Button } from '@arch-ui/button';

let CopyIcon = memo(function CopyIcon({ isCopied }) {
  return isCopied ? (
    <Animation name="pulse" duration="500ms">
      <CheckIcon css={{ color: colors.create }} />
    </Animation>
  ) : (
    <ClippyIcon />
  );
});

export let IdCopy = memo(function IdCopy({ id }) {
  let [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isCopied) {
      let timeoutID = setTimeout(() => {
        isCopied(false);
      }, 500);
      return () => {
        clearTimeout(timeoutID);
      };
    }
  }, [isCopied, setIsCopied]);

  return (
    <FlexGroup align="center" isContiguous>
      <div
        css={{
          color: colors.N30,
          fontFamily: 'Monaco, Consolas, monospace',
          fontSize: '0.85em',
        }}
      >
        ID: {id}
      </div>
      <CopyToClipboard
        as={Button}
        text={id}
        onSuccess={useCallback(() => {
          setIsCopied(true);
        }, [])}
        variant="subtle"
        title="Copy ID"
      >
        <CopyIcon isCopied={isCopied} />
        <A11yText>Copy ID</A11yText>
      </CopyToClipboard>
    </FlexGroup>
  );
});
