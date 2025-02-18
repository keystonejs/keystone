/* eslint-disable react/prop-types */
import React, { useState } from "react";
import {
  FieldContainer,
  FieldDescription,
  FieldLabel,
} from "@keystone-ui/fields";
import { CellContainer, CellLink } from "@keystone-6/core/admin-ui/components";
import {
  CardValueComponent,
  CellComponent,
  FieldController,
  FieldControllerConfig,
  FieldProps,
} from "@keystone-6/core/types";
import { FilterDepenancy, FilterViewConfig } from "..";
import DefaultView from "./components/styles/default";
import AntdView from "./components/styles/antd";
import { Fields } from "@react-awesome-query-builder/ui";
import FieldDependency from "./components/dependent";
export type ViewProps = FieldProps<typeof controller>;
export type ComponentProps = ViewProps & {
  fields: Fields;
  setFields: (value: Fields) => void;
};
export function Field(props: ViewProps) {
  // State to manage the fields data, fetched based on dependency.
  const [fields, setFields] = useState<Fields>(props.field.config.fields || {});

  const wrappedProps: ComponentProps = {
    ...props,
    value: JSON.parse(props.value || "null"),
    fields: fields,
    setFields,
  };
  let Interface;
  switch (props.field.config.style) {
    case "antd":
      Interface = AntdView;
      break;
    default:
      Interface = DefaultView;
  }
  return (
    <FieldContainer as="fieldset">
      <FieldLabel htmlFor={props.field.path}>{props.field.label}</FieldLabel>
      <FieldDescription id={`${props.field.path}-description`}>
        {props.field.description}
      </FieldDescription>
      {props.field.config.dependency?.field && (
        <FieldDependency
          {...(wrappedProps as ComponentProps & {
            field: { config: { dependency: FilterDepenancy } };
          })}
        />
      )}
      <Interface {...wrappedProps} />
    </FieldContainer>
  );
}

export const Cell: CellComponent = ({ item, field, linkTo }) => {
  const value = item[field.path] + "";
  return linkTo ? (
    <CellLink {...linkTo}>{value}</CellLink>
  ) : (
    <CellContainer>{value}</CellContainer>
  );
};
Cell.supportsLinkTo = true;

export const CardValue: CardValueComponent = ({ item, field }) => {
  return (
    <FieldContainer>
      <FieldLabel>{field.label}</FieldLabel>
      {item[field.path]}
    </FieldContainer>
  );
};

type FilterController = FieldController<string | null, string> & {
  config: FilterViewConfig;
};
export const controller = (
  config: FieldControllerConfig<FilterViewConfig>,
): FilterController => {
  return {
    config: config.fieldMeta,
    path: config.path,
    label: config.label,
    description: config.description,
    graphqlSelection: config.path,
    defaultValue: null,
    deserialize: (data) => {
      const value = data[config.path];
      return typeof value === "string" ? value : null;
    },
    serialize: (value) => ({ [config.path]: value }),
  };
};
