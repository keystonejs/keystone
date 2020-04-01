/* eslint-disable react/prop-types */
/** @jsx jsx */

import Tooltip from '@arch-ui/tooltip';
import { CheckIcon, XIcon, TrashcanIcon } from '@arch-ui/icons';
import { headerCase } from 'change-case';
import { jsx } from '@emotion/core';
import { useQuery } from '@apollo/react-hooks';
import gql from 'graphql-tag';
// eslint-disable-next-line no-unused-vars
import React from 'react';
import { IconButton } from '@arch-ui/button';
import { LinkExternalIcon } from '@arch-ui/icons/dist/icons.cjs.prod';
import { buildQueryFragment, fieldsToMap } from '../../../../lib/graphql-helpers';
import './Options.css';

// Styles
const booleanStyle = {
    width: '4rem',
    textAlign: 'center'
};

const linkStyle = {
    color: '#2684FF'
};

const unavailableStyle = {
    color: '#cacaca'
};

const scrollableStyle = {
    marginRight: '16px'
};

// Components
const Unavailable = () => <span className="relationship-list__unavailable">Not available</span>;

const OptionElement = ({ data, config = {} }) => {
    const { style = {}, type } = config;

    const isLink = data && type === 'link';
    const { hostname, pathname } = isLink ? new URL(data) : {};

    const isBoolean = type === 'boolean';

    return (
        <td
            key={data}
            title={typeof data === 'string' ? data : undefined}
            style={{
                ...(isBoolean ? booleanStyle : {}),
                ...(isLink ? linkStyle : {}),
                ...(!isBoolean && !data ? unavailableStyle : {}),
                ...style
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
                        <CheckIcon className="relationship-list__active" />
                    ) : (
                        <XIcon className="relationship-list__inactive" />
                    )}
                </div>
            )}

            {!isLink && !isBoolean && (data || <Unavailable />)}
        </td>
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
                id
            }
        }
    );

    if (!data) return null;

    const orderedData = Object.entries(fieldsToMap(innerFields)).map(([key, value]) => {
        const parsedData = data[config.ref.toLowerCase()];
        return value.length ? parsedData[key] && parsedData[key][value] : parsedData[key];
    });

    return (
        <tr>
            {orderedData.map((d, index) => {
                const fieldConfig = innerFields[index];

                return <OptionElement data={d} key={fieldConfig.name || fieldConfig} config={fieldConfig} />;
            })}

            <td>
                <Tooltip placement="top" content="See item">
                    {(tooltipRef) => (
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
            </td>

            <td>
                <Tooltip placement="top" content="Unlink item from relation">
                    {(tooltipRef) => (
                        <IconButton
                            aria-label="Unlink item from relation"
                            icon={TrashcanIcon}
                            onClick={(e) => removeItem(e, id)}
                            ref={tooltipRef}
                            variant="ghost"
                            className="relationship-list__remove"
                        />
                    )}
                </Tooltip>
            </td>
        </tr>
    );
};

const OptionTitle = ({ field }) => {
    const { name = field, type, style = {}, title, label = headerCase(name).replace('-', ' ') } =
        typeof field === 'object' ? field : {};

    return (
        <th style={{ ...(type === 'boolean' ? booleanStyle : {}), ...style }}>
            {title ? (
                <Tooltip placement="top" content={title}>
                    {(tooltipRef) => <span ref={tooltipRef}>{label}</span>}
                </Tooltip>
            ) : (
                label
            )}
        </th>
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
                    id
                }
            }));

        innerSelectChange(optionsSet, 'set-selected');
    };

    return options && options.length ? (
        <>
            <div style={{ ...(options.length > 4 ? scrollableStyle : {}) }}>
                <table className="relationship-list">
                    <thead>
                        <tr>
                            {config.innerFields.map((f) => (
                                <OptionTitle field={f} key={typeof f === 'string' ? f : f.name} />
                            ))}

                            {/* Empty header for link and remove button */}
                            <th />
                            <th />
                        </tr>
                    </thead>
                </table>
            </div>
            <div className="scrollable-list">
                <table className="relationship-list">
                    <tbody>
                        {options.map(({ id }) => (
                            <OptionRow id={id} key={id} removeItem={onRemoveClick} config={config} />
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    ) : (
        <h2 className="empty-relationship">Try adding a {config.ref}</h2>
    );
};

export default OptionsList;
