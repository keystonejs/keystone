<!--[meta]
section: api
subSection: field-types
title: File
[meta]-->

# File

## Usage

```js
keystone.createList('Applicant', {
  fields: {
    name: { type: Text },
    resume: { type: File, isRequired: true },
  },
});
```

### Config

| Option       | Type      | Default | Description                      |
| ------------ | --------- | ------- | -------------------------------- |
| `isRequired` | `Boolean` | `false` | Does this field require a value? |

---
