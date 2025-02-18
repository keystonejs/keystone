/* eslint-disable react/prop-types */
import { useEffect } from "react";
import { getGqlNames } from "@keystone-6/core/types";
import { useKeystone } from "@keystone-6/core/admin-ui/context";
import { gql, useQuery } from "@apollo/client";
import { ComponentProps } from "..";
import React from "react";

export default function FieldDependency(
  props: ComponentProps & {
    field: { config: { dependency: { list: string; field: string } } };
  },
) {
  // Utilizes the Keystone context for global state and GraphQL endpoint access.
  const keystone = useKeystone();
  // Determines the GraphQL list key and names based on field metadata.
  const gqlNames = getGqlNames({
    listKey: props.field.config.dependency.list,
    pluralGraphQLName: keystone.adminMeta.lists[
      props.field.config.dependency.list
    ].plural.replace(" ", ""),
  });

  // Identifies if there's a dependency value to fetch related fields dynamically.
  const dependent =
    props.itemValue[props.field.config.dependency.field.split(".")[0]];

  const dependentID =
    dependent?.value?.inner?.value ??
    dependent?.value?.value?.id ??
    dependent?.value ??
    undefined;

  const results = useQuery(
    gql`query($id: ID!) {
      item: ${gqlNames.itemQueryName}(where: {id: $id}) {
        ${createNestedString(
          (props.field.config.dependency?.field || "").split(".").slice(1),
        )}
      }
    }`,
    {
      variables: { id: dependentID },
      fetchPolicy: "no-cache",
      errorPolicy: "all",
      skip: dependentID === null,
    },
  );

  // Fetches and updates the field's options based on the dependency's value.
  useEffect(() => {
    if (props.field.config.dependency?.field && results.data) {
      const value = selectNestedKey(
        props.field.config.dependency.field.split(".").slice(1),
        results.data.item,
      );
      if (value) props.setFields(JSON.parse(value));
    }
  }, [results.data]);

  return <></>;
}

function createNestedString(fields: string[]): string {
  let nestedString = "";
  for (let i = fields.length - 1; i >= 0; i--) {
    if (i === fields.length - 1) {
      // First iteration (actually the last element of the array)
      nestedString = fields[i];
    } else {
      // Wrap the current field around the nestedString
      nestedString = `${fields[i]} { ${nestedString} }`;
    }
  }
  return nestedString;
}
function selectNestedKey(path: string[], obj: any): any {
  let result = obj;
  for (const key of path) {
    if (result[key] === undefined) {
      return undefined;
    }
    result = result[key];
  }
  return result;
}
