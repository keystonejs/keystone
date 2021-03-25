<!--[meta]
section: api
subSection: field-types
title: Checkbox
[meta]-->

# Checkbox

## GraphQL

`Checkbox` fields use the `Boolean` type in GraphQL.

### Input fields

| Field name | Type      | Description            |
| :--------- | :-------- | :--------------------- |
| `${path}`  | `Boolean` | The value to be stored |

### Output fields

| Field name | Type      | Description      |
| :--------- | :-------- | :--------------- |
| `${path}`  | `Boolean` | The stored value |

### Filters

| Field name    | Type | Description                     |
| :------------ | :--- | :------------------------------ |
| `${path}`     | `ID` | Matching the value provided     |
| `${path}_not` | `ID` | Not matching the value provided |
