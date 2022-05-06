---
'@keystone-6/fields-document': major
---

This release contains substantial changes to the component blocks API and the addition of array fields in component blocks. The breaking changes are entirely about defining components, _no data migration_ is required.

The main breaking changes that will affect all usages of component blocks are:

- In the arguments to the `component` function from `@keystone-6/fields-document/component-blocks`, the following have been renamed
  - `component` -> `preview`
  - `props` -> `schema`
- To access the preview props for the inner fields on an object field, you need to access `.fields.something` instead of `.something`
- The React element to render a child field is now at `props.element` instead of being `props`

As an example, the change needed for updating the "Hero" component block that can be seen on https://keystonejs.com/docs/guides/document-field-demo are shown below

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

This release introduces array fields to component blocks which accept another field (like an object, conditional, form or child field) and allow storing many of that inner field.

Here's an example of implementing a question & answers component block with the array field:

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

When there is a single child field within an array field, the document editor will allow pressing enter at the end of an element to add/delete at the start to delete, this allows creating editing experiences similar to the built-in lists. For example, here's a checkbox list:

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
  preview: function MyList(props) {
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

There are also some smaller improvements:

- All preview props now have an `onChange` function so that you can update more than one field in a component at a time
- All preview props now have a `schema` property to access the schema for those preview props
- Preview props are now referentially stable between renders when their value is stable

And other breaking changes that are unlikely to affect most users:

- The `ComponentPropField` type is now named `ComponentSchema`
- `FormField`'s are constrained to no longer allow storing `undefined`. They must be a string, number, boolean, null, array of one of these or object with one of these. This is required so that they can be represented within an array
- In the `props` object on a component block node, child fields are now stored as `null` instead of undefined. This is required so that they can be represented within an array. Loading documents that stored `undefined` instead of `null` for a child field will still work though, no data migration is required.
- `ObjectField` stores the fields on a property named `fields` instead of `value`
- The `ConditionalField` type now has two type parameters that look like this:
  ```ts
  type ConditionalField<
    DiscriminantField extends FormField<string | boolean, any>,
    ConditionalValues extends {
      [Key in `${DiscriminantField['defaultValue']}`]: ComponentSchema;
    }
  > = ...
  ```

