// this is used in react-server environments to avoid bundling UI when the reader API is used
// if you added a new field and get an error that there's missing a missing export here,
// you probably just need to add another empty export here

function empty() {
  throw new Error(
    "unexpected call to function that shouldn't be called in React server component environment"
  )
}

export let TextFieldInput = empty,
  UrlFieldInput = empty,
  SelectFieldInput = empty,
  RelationshipInput = empty,
  MultiselectFieldInput = empty,
  MultiRelationshipInput = empty,
  IntegerFieldInput = empty,
  NumberFieldInput = empty,
  DatetimeFieldInput = empty,
  DateFieldInput = empty,
  BlocksFieldInput = empty,
  CheckboxFieldInput = empty
