/** @jsx jsx */
import { Fragment, useState, useEffect } from 'react';
import { jsx } from '@emotion/core';
import styled from '@emotion/styled';

import copyToClipboard from 'clipboard-copy';

import * as icons from '@primer/octicons-react';
import { Grid, Cell } from '@arch-ui/layout';
import { colors } from '@arch-ui/theme';
import { Kbd } from '@arch-ui/typography';

const Instructions = styled('div')`
  color: ${colors.N60};
  font-size: 14px;
  margin: 16px 0 24px;
  min-height: 24px;
`;

const IconContainer = styled('button')`
  display: block;
  border: 0;
  width: 100%;
  background-color: white;
  border-radius: 0.2em;
  box-shadow: 0 2px 3px rgba(0, 0, 0, 0.075), 0 0 0 1px rgba(0, 0, 0, 0.1);
  color: #666;
  cursor: pointer;
  padding: 16px;
  position: relative;
  text-align: center;
  transition: box-shadow 80ms linear;

  &:hover {
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.2);
    color: #222;
  }
  &:active {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(0, 0, 0, 0.24);
    top: 1px;
  }
`;

const IconName = styled('div')`
  font-size: 13px;
  margin-top: 8px;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const IconsGuide = () => {
  const [altIsDown, setAltIsDown] = useState(false);
  const [copyText, setCopyText] = useState('');

  useEffect(() => {
    const handleKeyDown = e => {
      if (e.key === 'Alt') setAltIsDown(true);
    };

    const handleKeyUp = e => {
      if (e.key === 'Alt') setAltIsDown(false);
    };

    document.body.addEventListener('keydown', handleKeyDown, false);
    document.body.addEventListener('keyup', handleKeyUp, false);

    return () => {
      document.body.removeEventListener('keydown', handleKeyDown);
      document.body.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (copyText !== '') {
      setTimeout(() => setCopyText(''), 500);
    }
  }, [copyText]);

  const handleCopy = text => () => {
    setCopyText(text);
  };

  return (
    <Fragment>
      {altIsDown ? (
        <Instructions>Click an icon to copy its import code to your clipboard.</Instructions>
      ) : (
        <Instructions>
          Click an icon to copy its name to your clipboard. Hold <Kbd>⌥ option</Kbd> to copy the
          import code.
        </Instructions>
      )}
      <Grid gap={16}>
        {Object.keys(icons).map(name => {
          const importText = altIsDown ? `import { ${name} } from '@primer/octicons-react';` : name;
          const isCopied = copyText === importText;
          const Icon = isCopied ? icons.CheckIcon : icons[name];
          return (
            <Cell width={2} key={name}>
              <IconContainer
                onClick={() => {
                  copyToClipboard(importText).then(handleCopy(importText));
                }}
              >
                <Icon
                  css={{
                    fill: isCopied ? `${colors.create} !important` : 'inherit',
                    width: 24,
                    height: 24,
                  }}
                />
                <IconName className="icon-text">{isCopied ? 'Copied!' : name}</IconName>
              </IconContainer>
            </Cell>
          );
        })}
      </Grid>
    </Fragment>
  );
};

export default IconsGuide;
