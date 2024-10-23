/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import type { WidgetProps } from "@react-awesome-query-builder/ui";
import { ListInputWidget } from ".";

export const Config = {
  operators: {
    in: {
      elasticSearchQueryType: "term",
      jsonLogic: "in",
      label: "Any In",
      labelForFormat: "IN",
      formatOp: (
        field: unknown,
        _op: string,
        value: string,
        _valueSrc: unknown,
        _valueType: unknown,
        _opDef: unknown,
      ) => {
        const formattedValues = value
          .split(",")
          .map((v) => `'${v}'`)
          .join(", ");
        return `${field} NOT IN (${formattedValues})`;
      },
      reversedOp: "not_in",
      valueSources: ["value", "values"],
      valueTypes: ["text"],
    },
    not_in: {
      elasticSearchQueryType: "term",
      jsonLogic: "in",
      label: "Not In",
      labelForFormat: "NOT IN",
      formatOp: (
        field: unknown,
        _op: string,
        value: string,
        _valueSrc: unknown,
        _valueType: unknown,
        _opDef: unknown,
      ) => {
        const formattedValues = value
          .split(",")
          .map((v) => `'${v}'`)
          .join(", ");
        return `${field} NOT IN (${formattedValues})`;
      },
      reversedOp: "in",
      valueSources: ["value", "values"],
      valueTypes: ["text"],
    },
  },
  types: {
    text: {
      widgets: {
        listInput: {
          operators: ["in", "not_in"],
        },
      },
    },
  },
  widgets: {
    listInput: {
      valueSrc: "value",
      factory: (props: WidgetProps) => <ListInputWidget {...props} />,
    },
  },
};
