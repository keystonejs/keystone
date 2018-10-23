/** @jsx jsx */
import { jsx } from '@emotion/core';
import { Component, Fragment } from 'react';
import styled from '@emotion/styled';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import * as icons from '@voussoir/icons';

import { Grid, Cell } from '@voussoir/ui/src/primitives/layout';
import { colors } from '@voussoir/ui/src/theme';
import { Kbd } from '@voussoir/ui/src/primitives/typography';

const Instructions = styled('div')`
  color: ${colors.N60};
  font-size: 14px;
  margin: 16px 0 24px;
  min-height: 24px;
`;

const IconContainer = styled('div')`
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

export default class IconsGuide extends Component {
  state = { altIsDown: false, copyText: '' };
  componentDidMount() {
    document.body.addEventListener('keydown', this.handleKeyDown, false);
    document.body.addEventListener('keyup', this.handleKeyUp, false);
  }
  componentWillUnmount() {
    document.body.removeEventListener('keydown', this.handleKeyDown);
    document.body.removeEventListener('keyup', this.handleKeyUp);
  }
  handleKeyDown = e => {
    if (e.key !== 'Alt') return;
    this.setState({ altIsDown: true });
  };
  handleKeyUp = e => {
    if (e.key !== 'Alt') return;
    this.setState({ altIsDown: false });
  };
  handleCopy = (text, success) => {
    if (success) {
      this.setState({ copyText: text }, () => {
        setTimeout(() => {
          this.setState({ copyText: '' });
        }, 500);
      });
    }
  };
  render() {
    const { altIsDown, copyText } = this.state;
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
            const importText = altIsDown ? `import { ${name} } from '@voussoir/icons';` : name;
            const isCopied = copyText === importText;
            const Icon = isCopied ? icons.CheckIcon : icons[name];
            return (
              <Cell width={2} key={name}>
                <CopyToClipboard text={importText} onCopy={this.handleCopy}>
                  <IconContainer>
                    <Icon
                      css={{
                        fill: isCopied ? `${colors.create} !important` : 'inherit',
                        width: 24,
                        height: 24,
                      }}
                    />
                    <IconName className="icon-text">{isCopied ? 'Copied!' : name}</IconName>
                  </IconContainer>
                </CopyToClipboard>
              </Cell>
            );
          })}
        </Grid>
      </Fragment>
    );
  }
}
