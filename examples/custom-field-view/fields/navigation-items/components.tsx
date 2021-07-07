/** @jsxRuntime classic */
/** @jsx jsx */

import { FieldProps } from '@keystone-next/types';
import css from '@emotion/css';
import { jsx } from '@keystone-ui/core';
import { Button } from '@keystone-ui/button';
import { FieldContainer, FieldLabel, TextInput } from '@keystone-ui/fields';
import { MinusCircleIcon, EditIcon } from '@keystone-ui/icons';
import { controller } from '@keystone-next/fields/types/json/views';
import { Fragment, useState } from 'react';

interface NavigationItem {
  label: string;
  href: string;
}

const styles = {
  form: {
    field: css`
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      width: 100%;
      margin: 1rem 0 0 0;
    `,
    label: css`
      width: 10%;
    `,
    input: css`
      width: 90%;
    `,
    button: css`
      margin: 1rem 0.5rem 0 0;
    `,
  },
  list: {
    ul: css`
      list-style: none;
      margin: 1rem 0 0 0;
      padding: 0;
    `,
    li: css`
      display: flex;
      align-items: center;
      flex-wrap: nowrap;
      width: 100%;

      &:nth-of-type(2n) > div:nth-of-type(1) {
        background-color: white;
      }
    `,
    data: css`
      background-color: #eff3f6;
      padding: 0.5rem;
      flex: auto;
      display: flex;
      align-items: flex-start;
      flex-wrap: nowrap;
    `,
    dataLabel: css`
      width: 40%;
    `,
    dataHref: css`
      width: 60%;
    `,
    optionButton: css`
      margin: 0 0 0 0.5rem;
    `,
  },
};

export const Field = ({
  field,
  value,
  onChange,
  autoFocus,
}: FieldProps<typeof controller>) => {
  const [labelValue, setLabelValue] = useState('');
  const [hrefValue, setHrefValue] = useState('');
  const [index, setIndex] = useState<number | null>(null);

  const navigationItems: NavigationItem[] = value ? JSON.parse(value) : [];

  const onSubmitNewNavigationItem = () => {
    if (onChange) {
      const navigationItemsCopy = [...navigationItems, { label: labelValue, href: hrefValue }];
      onChange(JSON.stringify(navigationItemsCopy));
      onCancelNavigationItem();
    }
  };

  const onDeleteNavigationItem = (index: number) => {
    if (onChange) {
      const navigationItemsCopy = [...navigationItems];
      navigationItemsCopy.splice(index, 1);
      onChange(JSON.stringify(navigationItemsCopy));
      onCancelNavigationItem();
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
      const navigationItemsCopy = [...navigationItems];
      navigationItemsCopy[index] = { label: labelValue, href: hrefValue };
      onChange(JSON.stringify(navigationItemsCopy));
      onCancelNavigationItem();
    }
  };

  const onCancelNavigationItem = () => {
    setIndex(null);
    setLabelValue('');
    setHrefValue('');
  };

  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {onChange && (
        <Fragment>
          <div css={styles.form.field}>
            <FieldLabel css={styles.form.label}>Label</FieldLabel>
            <TextInput
              autoFocus={autoFocus}
              onChange={event => setLabelValue(event.target.value)}
              value={labelValue}
              css={styles.form.input}
            />
          </div>
          <div css={styles.form.field}>
            <FieldLabel css={styles.form.label}>Href</FieldLabel>
            <TextInput
              autoFocus={autoFocus}
              onChange={event => setHrefValue(event.target.value)}
              value={hrefValue}
              css={styles.form.input}
            />
          </div>

          {index !== null ? (
            <Fragment>
              <Button onClick={onUpdateNavigationItem} css={styles.form.button}>
                Update
              </Button>
              <Button onClick={onCancelNavigationItem} css={styles.form.button}>
                Cancel
              </Button>
            </Fragment>
          ) : (
            <Button onClick={onSubmitNewNavigationItem} css={styles.form.button}>
              Add
            </Button>
          )}
        </Fragment>
      )}
      <ul css={styles.list.ul}>
        {navigationItems.map((navigationItem: NavigationItem, i: number) => {
          return (
            <li key={`navigation-item-${i}`} css={styles.list.li}>
              <div css={styles.list.data}>
                <div css={styles.list.dataLabel}>{navigationItem.label}</div>
                <div css={styles.list.dataHref}>
                  <a href={navigationItem.href} target="_blank">
                    {navigationItem.href}
                  </a>
                </div>
              </div>
              {onChange && (
                <div>
                  <Button
                    size="small"
                    onClick={() => onEditNavigationItem(i)}
                    css={styles.list.optionButton}
                  >
                    <EditIcon size="small" color="blue" />
                  </Button>
                  <Button size="small" css={styles.list.optionButton}>
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
  );
};
