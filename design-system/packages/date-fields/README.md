# Date Inputs and Pickers

Date components are used to display past, present, or future dates. The kind of
date (exact, approximate, memorable) you are requesting from the user will
determine which component is best to use.

## Date Field

Use if the date can be remembered by the user easily, such as a date of birth,
and they don’t need a calendar to anticipate the dates.

```jsx live
const [value, setValue] = useState();
return <DateField label="Date of birth" value={value} onChange={setValue} />;
```

## Date Picker

Use a calendar picker when the user needs to know a date’s relationship to other
days or when a date could be variable. It allows the user to view and pick dates
from a calendar widget.

```jsx live
const [value, setValue] = useState();
return (
  <DatePickerField
    label="Pay date"
    value={value}
    onChange={setValue}
    onClear={() => setValue(undefined)}
  />
);
```
