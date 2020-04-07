---
'@keystonejs/api-tests': minor
'@keystonejs/keystone': minor
---

Exposes `dataType` and `options` meta data for `Select` fields:
    ```graphql
    query {
      _UserMeta {
        schema {
          fields {
            name
            type
            ...on _SelectMeta {
              dataType
              options {
                label
              }
            }
          }
        }
      }
    }
    ```
