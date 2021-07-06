/** @jsxRuntime classic */
/** @jsx jsx */

import { FieldProps } from '@keystone-next/types';
import css from '@emotion/css';
import { jsx, useTheme } from '@keystone-ui/core';
import { Button } from '@keystone-ui/button';
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields';
import { MinusCircleIcon, EditIcon } from '@keystone-ui/icons';
import { controller } from '@keystone-next/fields/types/json/views';
import { Fragment, useState } from 'react';

interface NavigationItem {
  label: string;
  href: string;
}

export const Field = ({ field, value, onChange, autoFocus }: FieldProps<typeof controller>) => {
  const [labelValue, setLabelValue] = useState('');
  const [hrefValue, setHrefValue] = useState('');
  const [index, setIndex] = useState<number | null>(null);
  const { colors } = useTheme();

  const navigationItems: NavigationItem[] = value ? JSON.parse(value) : [];

  const onSubmitNewNavigationItem = () => {
    if (onChange) {
      let newNavigationItemsCopy;
      if (index !== null) {
        const newNavigationItemsCopy = [...navigationItems];
        newNavigationItemsCopy[index] = { label: labelValue, href: hrefValue };
      } else {
        newNavigationItemsCopy = [...navigationItems, { label: labelValue, href: hrefValue }];
      }
      onChange(JSON.stringify(newNavigationItemsCopy));
      onCancelNavigationItem();
    }
  };

  const onDeleteNavigationItem = (index: number) => {
    if (onChange) {
      const newNavigationItemsCopy = [...navigationItems];
      newNavigationItemsCopy.splice(index, 1);
      onChange(JSON.stringify(newNavigationItemsCopy));
    }
  };

  const onEditNavigationItem = (index: number) => {
    if (onChange) {
      setIndex(index);
      setLabelValue(navigationItems[index].label);
      setHrefValue(navigationItems[index].href);
    }
  };

  const onUpdateNavigationItem = () => {
    if (onChange && index !== null) {
      const newNavigationItemsCopy = [...navigationItems];
      newNavigationItemsCopy[index] = { label: labelValue, href: hrefValue };
      onChange(JSON.stringify(newNavigationItemsCopy));
      onCancelNavigationItem();
    }
  };

  const onCancelNavigationItem = () => {
    setIndex(null);
    setLabelValue('');
    setHrefValue('');
  };

  return (
    <Fragment>
      <FieldContainer>
        <FieldLabel>{field.label}</FieldLabel>
        {onChange && (
          <Fragment>
            <TextInput
              autoFocus={autoFocus}
              onChange={event => setLabelValue(event.target.value)}
              value={labelValue}
              css={{
                margin: '1rem 0 0 0',
              }}
            />
            <TextInput
              autoFocus={autoFocus}
              onChange={event => setHrefValue(event.target.value)}
              value={hrefValue}
              css={{
                margin: '1rem 0 0 0',
              }}
            />
            {index !== null ? (
              <Fragment>
                <Button
                  css={{
                    margin: '1rem 0 0 0',
                  }}
                  onClick={onUpdateNavigationItem}
                >
                  Update
                </Button>
                <Button
                  css={{
                    margin: '1rem 0 0 1rem',
                  }}
                  onClick={onCancelNavigationItem}
                >
                  Cancel
                </Button>
              </Fragment>
            ) : (
              <Button
                css={{
                  margin: '1rem 0 0 0',
                }}
                onClick={onSubmitNewNavigationItem}
              >
                Add
              </Button>
            )}
          </Fragment>
        )}
        <ul
          css={css`
            list-style: none;
            margin: 1rem 0 0 0;
            padding: 0;
          `}
        >
          {navigationItems.map((navigationItem: NavigationItem, i: number) => {
            return (
              <li
                key={i}
                css={css`
                  display: flex;
                  align-items: flex-start;
                  flex-wrap: nowrap;
                  width: 100%;

                  & > div {
                    &:nth-of-type(2) {
                      padding: 0 0 0 1rem;
                    }
                  }

                  &:nth-of-type(2n) > div:nth-of-type(1) {
                    background-color: white;
                  }
                `}
              >
                <div
                  css={css`
                    background-color: ${colors.backgroundDim};
                    padding: 0.5rem;
                    flex: auto;
                    display: flex;
                    align-items: flex-start;
                    flex-wrap: nowrap;
                  `}
                >
                  <div
                    css={css`
                      width: 40%;
                    `}
                  >
                    {navigationItem.label}
                  </div>
                  <div
                    css={css`
                      width: 60%;
                    `}
                  >
                    <a href={navigationItem.href} target="_blank">
                      {navigationItem.href}
                    </a>
                  </div>
                </div>
                {onChange && (
                  <div>
                    <Button size="small" onClick={() => onEditNavigationItem(i)}>
                      <EditIcon size="small" color="blue" />
                    </Button>
                    <Button
                      size="small"
                      css={css`
                        margin: 0 0 0 0.5rem;
                      `}
                    >
                      <MinusCircleIcon
                        size="small"
                        color="red"
                        onClick={() => onDeleteNavigationItem(i)}
                      />
                    </Button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </FieldContainer>
    </Fragment>
  );
};
