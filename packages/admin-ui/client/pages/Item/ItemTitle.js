/** @jsx jsx */
import { jsx } from '@emotion/core';
import { memo } from 'react';

import { TriangleLeftIcon, PlusIcon } from '@arch-ui/icons';
import { FlexGroup } from '@arch-ui/layout';
import { Title } from '@arch-ui/typography';
import { IconButton } from '@arch-ui/button';

import { Link } from '../../providers/Router';

const TitleLink = ({ children, route, params, ...props }) => (
  <Link route={route} params={params}>
    <a
      css={{
        position: 'relative',
        textDecoration: 'none',

        ':hover': {
          textDecoration: 'none',
          cursor: 'pointer',
        },

        '& > svg': {
          opacity: 0,
          height: 16,
          width: 16,
          position: 'absolute',
          transitionProperty: 'opacity, transform, visibility',
          transitionDuration: '300ms',
          transform: 'translate(-75%, -50%)',
          top: '50%',
          visibility: 'hidden',
        },

        ':hover > svg': {
          opacity: 0.66,
          visibility: 'visible',
          transform: 'translate(-110%, -50%)',
        },
      }}
      {...props}
    >
      <TriangleLeftIcon />
      {children}
    </a>
  </Link>
);

export const ItemTitle = memo(({ titleText, list, onCreateClick }) => (
  <FlexGroup align="center" justify="space-between">
    <Title as="h1" margin="both">
      <TitleLink route="list" params={{ listPath: list.path }}>
        {list.label}
      </TitleLink>
      : {titleText}
    </Title>
    <IconButton appearance="create" icon={PlusIcon} onClick={onCreateClick}>
      Create
    </IconButton>
  </FlexGroup>
));
