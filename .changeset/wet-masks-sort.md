---
'@keystonejs/fields': major
---

`many` relationships now have a GraphQL type of `[Item!]!`, rather than `[Item]`.

The old type of `[Item]` implied that the relationship field could return `null`, or that some of the items it returned could be `null`. In practice, neither of these things ever happened. The new type better reflects this reality.

The filter argument `{path}_is_null` has also been removed for `many` relationships, as it does not apply to a non-null array type.
