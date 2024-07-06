import React, { useState, useCallback, useEffect } from "react";
import merge from "lodash.merge";
import InitConfig from "../config";

import type {
  Config,
  ImmutableTree,
  BuilderProps,
} from "@react-awesome-query-builder/ui";
import {
  Query,
  Builder,
  Utils as QbUtils,
  BasicConfig,
} from "@react-awesome-query-builder/ui";
import "@react-awesome-query-builder/ui/css/styles.css";
import { ComponentProps } from "../..";

// Define the View component.
export default function View(props: ComponentProps) {
  // State for the query builder configuration, initialized with the initial configuration and fields.
  const [config, setConfig] = useState<Config>({
    ...merge(BasicConfig, InitConfig),
    fields: props.fields,
  });

  // Effect hook to update fields in the configuration whenever props.fields change.
  useEffect(() => {
    if (props.fields && Object.keys(props.fields).length > 0) {
      setConfig((prev) => ({ ...prev, fields: props.fields }));
    }
  }, [props.fields]);

  // State for the query builder tree, initialized with a default group node.
  const [tree, setTree] = useState<ImmutableTree>(
    QbUtils.loadTree({
      id: QbUtils.uuid(), // Generate a unique ID for the root node.
      type: "group", // Set the node type to "group".
    }),
  );

  // Effect hook to update the query builder tree whenever the config changes.
  useEffect(() => {
    if (
      Object.keys(config.fields).length > 0 &&
      props.value &&
      Object.keys(props.value).length > 0
    ) {
      setTree((prev) => {
        return props.value
          ? QbUtils.loadFromJsonLogic(props.value, config) || prev
          : prev;
      });
    }
  }, [config]);

  // Callback to handle changes in the query builder's state.
  const onChange = useCallback(
    (value: ImmutableTree, config: Config) => {
      setTree(value);
      if (props.onChange) {
        const logic = QbUtils.jsonLogicFormat(value, config)["logic"];
        if (logic) props.onChange(JSON.stringify(logic));
      }
    },
    [props.onChange],
  );

  // Callback to render the query builder UI.
  const renderBuilder = useCallback((props: BuilderProps) => {
    return (
      <div className="query-builder-container">
        <div className="query-builder qb-lite">
          {Object.keys(props.config.fields).length > 0 ? (
            <Builder {...props} />
          ) : null}
        </div>
      </div>
    );
  }, []);

  // Render the Query component with the current configuration and tree, or null if no fields are defined.
  return (
    <Query
      {...config}
      value={tree}
      onChange={onChange}
      renderBuilder={renderBuilder}
    />
  );
}
