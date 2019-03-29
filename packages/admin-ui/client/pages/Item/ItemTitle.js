/** @jsx jsx */
import { jsx } from '@emotion/core';
import { memo } from 'react';
import { Link } from 'react-router-dom';

import { TriangleLeftIcon, PlusIcon } from '@arch-ui/icons';
import { FlexGroup } from '@arch-ui/layout';
import { Title } from '@arch-ui/typography';
import { IconButton } from '@arch-ui/button';

const TitleLink = ({ children, ...props }) => (
  <Link
    css={{
      position: 'relative',
      textDecoration: 'none',

      ':hover': {
        textDecoration: 'none',
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
  </Link>
);

export let ItemTitle = memo(function ItemTitle({ titleText, list, adminPath, onCreateClick }) {
  const listHref = `${adminPath}/${list.path}`;

  return (
    <FlexGroup align="center" justify="space-between">
      <Title as="h1" margin="both">
        <TitleLink to={listHref}>{list.label}</TitleLink>: {titleText}
      </Title>
      <IconButton variant="ghost" appearance="primary" icon={PlusIcon} onClick={onCreateClick}>
        Create
      </IconButton>
    </FlexGroup>
  );
});
