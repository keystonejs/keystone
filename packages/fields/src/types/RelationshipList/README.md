<!--[meta]
section: api
subSection: field-types
title: RelationshipList
[meta]-->

# RelationshipList

This is a visual change on Relationship and inherits from that to create a table out of the selected options:

-   It is always a one-to-many relation
-   You can use all the [nested mutations](https://github.com/keystonejs/keystone/tree/master/packages/fields/src/types/Relationship#nested-mutations) for RelationShip

## Usage

```javascript
keystone.createList('User', {
    fields: {
        name: { type: Text },
        posts: { type: RelationshipList, ref: 'Post', innerFields: ['title', 'content'] }
    }
});

keystone.createList('Post', {
    fields: {
        title: { type: Text },
        content: { type: Text }
    }
});
```

### Config

| Option        | Type               | Default | Description                                                     |
| ------------- | ------------------ | ------- | --------------------------------------------------------------- |
| `isUnique`    | `Boolean`          | `false` | Adds a unique index that allows only unique values to be stored |
| `innerFields` | `[String | Field]` | `[]`    | Options to generate the table out of the item properties        |

### Field Definition

| Name    | Type                   | Default | Description                                                                                                        |
| ------- | ---------------------- | ------- | ------------------------------------------------------------------------------------------------------------------ |
| `name`  | `String`               |         | Name of the property of the relation item, you can get a nested property with a dot notation (`relation.property`) |
| `label` | `String`               | `name`  | Text that is displayed in the table header                                                                         |
| `title` | `String`               | `name`  | Text that is displayed in the table header on hover as the HTML property "title"                                   |
| `type`  | `"link"|"boolean"`     |         | If the property is a boolean or a link, it creates a custom cell specific to each                                  |
| `style` | `CSS JSX Style Object` | `{}`    | CSS Styles to be applied to the header and column of the item                                                      |

The field can also be a string, which should be the `name` property, it will create the other properties out of that

#### Field Example

```javascript
keystone.createList('User', {
    fields: {
        name: { type: Text },
        posts: {
            type: RelationshipList,
            ref: 'eBook',
            innerFields: [
                {
                    name: 'private',
                    type: 'boolean'
                },
                {
                    name: 'title',
                    label: 'Post Title',
                    title: 'Title of how the post was published',
                    style: {
                        width: '30%',
                        background: '#ff3dab',
                        color: 'black'
                    }
                },
                {
                    name: 'publicUrl',
                    label: 'Published URL',
                    type: 'link'
                },
                'publisher.name'
            ]
        }
    }
});
```
