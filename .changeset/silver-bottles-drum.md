---
'@keystone-6/fields-document': major
---

This release contains substantial changes to the underlying document-editor component block interfaces, with the addition of array fields.
The breaking changes are only for defining components, _no database migration is needed_.

The primary breaking changes for component blocks are:

- For the arguments to the `component` function from `@keystone-6/fields-document/component-blocks`, the following properties have been renamed
  - `component` -> `preview`
  - `props` -> `schema`
- When using the fields within your preview component - as defined by your component `.schema` (previous `.props`) - you now use `props.fields.{innerFieldName}` instead of `props.{innerFieldName}`.
For example, `props.fields.title` instead of `props.title`.
For a nested example, `props.fields.someObject.fields.title` instead of `props.someObject.title`.

- The React element to render for a child field is now `props.{innerFieldName}.element` instead of `props.{innerFieldName}`.

As an example, the changes needed for updating the "Hero" component block as seen on https://keystonejs.com/docs/guides/document-field-demo is shown shown below

```diff
   hero: component({
-    component: props => {
+    preview: props => {
       return (
         <div
           css={{
             backgroundColor: 'white',
-            backgroundImage: `url(${props.imageSrc.value})`,
+            backgroundImage: `url(${props.fields.imageSrc.value})`,
             backgroundPosition: 'center',
             backgroundSize: 'cover',
             display: 'flex',
@@ -51,7 +189,7 @@ export const componentBlocks = {
               textShadow: '0px 1px 3px black',
             }}
           >
-            {props.title}
+            {props.fields.title.element}
           </div>
           <div
             css={{
@@ -63,9 +201,9 @@ export const componentBlocks = {
               textShadow: '0px 1px 3px black',
             }}
           >
-            {props.content}
+            {props.fields.content.element}
           </div>
-          {props.cta.discriminant ? (
+          {props.fields.cta.discriminant ? (
             <div
               css={{
                 backgroundColor: '#F9BF12',
@@ -78,14 +216,14 @@ export const componentBlocks = {
                 padding: '12px 16px',
               }}
             >
-              {props.cta.value.text}
+              {props.fields.cta.value.fields.text.element}
             </div>
           ) : null}
         </div>
       );
     },
     label: 'Hero',
-    props: {
+    schema: {
       title: fields.child({ kind: 'inline', placeholder: 'Title...' }),
       content: fields.child({ kind: 'block', placeholder: '...' }),
       imageSrc: fields.text({
```

Additionally this release introduces an array field `fields.array` for component block which represents an array of another field type, such as an object, conditional, form or other child field.
See below for an example of a question & answers component block with the new array field:

```tsx
import { fields, component, NotEditable } from '@keystone-6/fields-document/component-blocks';

component({
  label: 'Questions & Answers',
  schema: {
    questions: fields.array(
      fields.object({
        question: fields.child({ placeholder: 'Question', kind: 'inline' }),
        answer: fields.child({ placeholder: 'Answer', formatting: 'inherit', kind: 'block' }),
      })
    ),
  },
  preview: props => {
    return (
      <div>
        {props.fields.questions.elements.map(questionAndAnswer => {
          return (
            <div key={questionAndAnswer.key}>
              <h2>{questionAndAnswer.fields.question.element}</h2>
              <p>{questionAndAnswer.fields.answer.element}</p>
              <NotEditable>
                <Button
                  onClick={() => {
                    props.fields.questions.onChange(
                      props.fields.questions.elements
                        .filter(x => x.key !== questionAndAnswer.key)
                        .map(x => ({ key: x.key }))
                    );
                  }}
                >
                  Remove
                </Button>
              </NotEditable>
            </div>
          );
        })}
        <NotEditable>
          <Button
            onClick={() => {
              props.fields.questions.onChange([
                ...props.fields.questions.elements,
                { key: undefined },
              ]);
            }}
          >
            Insert
          </Button>
        </NotEditable>
      </div>
    );
  },
});
```

Similar to the built-in document-editor lists,  when an array field has only 1 element,  pressing enter adds a new element and pressing delete removes an element.
For example, here's a list of checkboxes:

```tsx
/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@keystone-ui/core';
import { useEffect } from 'react';
import { fields, component } from '@keystone-6/fields-document/component-blocks';

component({
  label: 'Checkbox List',
  schema: {
    children: fields.array(
      fields.object({
        done: fields.checkbox({ label: 'Done' }),
        content: fields.child({ kind: 'inline', placeholder: '', formatting: 'inherit' }),
      })
    ),
  },
  chromeless: true,
  preview: (props) => {
    useEffect(() => {
      if (!props.fields.children.elements.length) {
        props.fields.children.onChange([{ key: undefined }]);
      }
    });

    return (
      <ul css={{ padding: 0 }}>
        {props.fields.children.elements.map(element => (
          <li css={{ listStyle: 'none' }} key={element.key}>
            <input
              contentEditable="false"
              css={{ marginRight: 8 }}
              type="checkbox"
              checked={element.fields.done.value}
              onChange={event => element.fields.done.onChange(event.target.checked)}
            />
            <span
              style={{
                textDecoration: element.fields.done.value ? 'line-through' : undefined,
              }}
            >
              {element.fields.content.element}
            </span>
          </li>
        ))}
      </ul>
    );
  },
});
```

Finally, some other changes introduced in this release are:

- Each of the `preview` props `fields` (and their inner fields, if any) now have an `onChange` function so that you can update more than one field in a component at a time
- Each of the `preview` props `fields` (and their inner fields, if any) now have a `schema` property to access their respective schema at that level
- Generally, preview props are now referentially stable between renders when their value is stable

Some internal breaking changes that are unlikely to affect users are:

- The `ComponentPropField` type is now named `ComponentSchema`
- `FormField`'s are now constrained to prevent storing `undefined`.
They must be a string, number, boolean, null, array of one of these or an object with one of these.
This is required so that they can be represented within a JSON array.
- Within the database, for the `props` object on a component-block node, child fields are now stored as `null` instead of `undefined`.
This is required so that they can be represented within a JSON array.
Component-block nodes that previously had `undefined` instead of `null` for a child field will continue to work though, no data migration is required.
- The `ObjectField` type now has inner fields on a property named `fields` instead of `value`
- The `ConditionalField` type now has two type parameters that look like this:
  ```ts
  type ConditionalField<
    DiscriminantField extends FormField<string | boolean, any>,
    ConditionalValues extends {
      [Key in `${DiscriminantField['defaultValue']}`]: ComponentSchema;
    }
  > = ...
  ```
