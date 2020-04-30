/* eslint-disable react/prop-types */
/** @jsx jsx */

import Tooltip from '@arch-ui/tooltip';
import { CheckIcon, XIcon, TrashcanIcon } from '@arch-ui/icons';
import { headerCase } from 'change-case';
import { jsx, css } from '@emotion/core';
import styled from '@emotion/styled';

import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
// eslint-disable-next-line no-unused-vars
import React, { Fragment, useState } from 'react';
import { IconButton } from '@arch-ui/button';
import { LinkExternalIcon } from '@arch-ui/icons';
import { buildQueryFragment, fieldsToMap } from '../graphql-helpers';
import {
  Table,
  TableRow,
  HeaderCell,
  BodyCell,
} from '../../../../../app-admin-ui/client/components/ListTable';
import { colors } from '@arch-ui/theme/src';

const maxVisible = 8;

// Styles
const booleanStyle = {
  width: '4rem',
  textAlign: 'center',
};

const linkStyle = {
  color: '#2684FF',
};

const unavailableStyle = {
  color: '#cacaca',
};

const scrollableStyle = {
  marginRight: '16px',
};

const tableStyle = {
  tableLayout: 'fixed',
};

const lastTwoColumns = css`
  > *:last-of-type,
  > *:nth-last-of-type(2) {
    width: 48px;
  }
`;

export const Unavailable = styled('span')({
  color: '#cacaca',
});

const OptionElement = ({ data, config = {} }) => {
  const { style = {}, type } = config;

  const isLink = data && type === 'link';
  const { hostname, pathname } = isLink ? new URL(data) : {};

  const isBoolean = type === 'boolean';

  return (
    <BodyCell
      key={data}
      title={typeof data === 'string' ? data : undefined}
      style={{
        ...(isBoolean ? booleanStyle : {}),
        ...(isLink ? linkStyle : {}),
        ...(!isBoolean && !data ? unavailableStyle : {}),
        ...style,
      }}
    >
      {isLink && (
        <a href={data} target="_blank" rel="noopener noreferrer">
          {hostname + pathname}
        </a>
      )}

      {isBoolean && (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {data ? (
            <CheckIcon
              css={css`
                width: 25px;
                path {
                  fill: #d64242;
                }
              `}
            />
          ) : (
            <XIcon
              css={css`
                width: 18px;
                path {
                  fill: #2684ff;
                }
              `}
            />
          )}
        </div>
      )}

      {!isLink && !isBoolean && (data || <Unavailable>Not available</Unavailable>)}
    </BodyCell>
  );
};

const OptionRow = ({ id, removeItem, config }) => {
  const { ref, innerFields, path } = config;

  const { data } = useQuery(
    gql`
            query($id: ID!) {
                ${ref.toLowerCase()}: ${ref}(where: { id: $id }) {
                    ${buildQueryFragment(innerFields)}
                }
            }
        `,
    {
      variables: {
        id,
      },
    }
  );

  if (!data) return null;

  const orderedData = Object.entries(fieldsToMap(innerFields)).map(([key, value]) => {
    const parsedData = data[config.ref.toLowerCase()];
    return value.length ? parsedData[key] && parsedData[key][value] : parsedData[key];
  });

  return (
    <TableRow
      css={css`
        &:nth-of-type(even) {
          background: ${colors.N05};
        }

        ${lastTwoColumns}
      `}
    >
      {orderedData.map((d, index) => {
        const fieldConfig = innerFields[index];

        return (
          <OptionElement data={d} key={fieldConfig.name || fieldConfig} config={fieldConfig} />
        );
      })}

      <BodyCell>
        <Tooltip placement="top" content="See item">
          {tooltipRef => (
            <IconButton
              aria-label="See item"
              icon={LinkExternalIcon}
              ref={tooltipRef}
              target="_blank"
              to={`/admin/${path.toLowerCase()}/${id}`}
              variant="ghost"
            />
          )}
        </Tooltip>
      </BodyCell>

      <BodyCell>
        <Tooltip placement="top" content="Unlink item from relation">
          {tooltipRef => (
            <IconButton
              aria-label="Unlink item from relation"
              icon={TrashcanIcon}
              onClick={e => removeItem(e, id)}
              ref={tooltipRef}
              variant="ghost"
              css={css`
                path {
                  fill: #6c798f;
                }

                &:hover path {
                  fill: #d64242;
                }
              `}
            />
          )}
        </Tooltip>
      </BodyCell>
    </TableRow>
  );
};

const OptionTitle = ({ field }) => {
  const { name = field, type, style = {}, title, label = headerCase(name).replace('-', ' ') } =
    typeof field === 'object' ? field : {};

  return (
    <HeaderCell style={{ ...(type === 'boolean' ? booleanStyle : {}), ...style }}>
      {title ? (
        <Tooltip placement="top" content={title}>
          {tooltipRef => <span ref={tooltipRef}>{label}</span>}
        </Tooltip>
      ) : (
        label
      )}
    </HeaderCell>
  );
};

const OptionsList = ({ options, config, innerSelectChange }) => {
  const onRemoveClick = (e, idClick) => {
    e.preventDefault();

    const optionsSet = options
      .filter(({ id }) => String(id) !== String(idClick))
      .map(({ id, name }) => ({
        label: name,
        value: {
          __typename: config.ref,
          _label_: name,
          id,
        },
      }));

    innerSelectChange(optionsSet, 'set-selected');
  };

  return options && options.length ? (
    <Fragment>
      <div style={{ ...(options.length > maxVisible ? scrollableStyle : {}) }}>
        <Table style={tableStyle}>
          <thead>
            <TableRow css={lastTwoColumns}>
              {config.innerFields.map(f => (
                <OptionTitle field={f} key={typeof f === 'string' ? f : f.name} />
              ))}

              {/* Empty header for link and remove button */}
              <HeaderCell />
              <HeaderCell />
            </TableRow>
          </thead>
        </Table>
      </div>
      <div
        css={css`
          max-height: ${54 * maxVisible + 1}px;
          overflow-y: auto;
          margin-bottom: 1rem;
        `}
      >
        <Table style={tableStyle}>
          <tbody>
            {options.map(({ id }) => (
              <OptionRow id={id} key={id} removeItem={onRemoveClick} config={config} />
            ))}
          </tbody>
        </Table>
      </div>
    </Fragment>
  ) : (
    <h2
      css={css`
        color: #97a0af;
        font-size: 1.2rem;
        font-weight: normal;
        margin-top: 0.5rem;
        margin-bottom: 1rem;
        text-align: center;
      `}
    >
      Try adding a {config.ref}
    </h2>
  );
};

export default OptionsList;
