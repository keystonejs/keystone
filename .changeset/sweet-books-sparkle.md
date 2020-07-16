---
'@keystonejs/orm': minor
'@keystonejs/api-tests': patch
'@keystonejs/demo-project-meetup': patch
'@keystonejs/cypress-project-basic': patch
---

**Combine result of `runChunkedMutation` query**. 
Initial implementation of `runChunkedMutation` array was returning the result in the format of nested array. 
```js
  // The result is of the format: 
  const result = [{createUsers: [{id: '123', name: 'aman'}]}, {createUsers: [{id: '456', name: 'mike'}]}]


```
It was making hard to extract the actual data. This refactoring combines the result of chunk promise arrays into a single object with key based of `createManyInputName`. 
```js
  // Combine all objects into one array keyed by the `createUsers`, such that, the output is: 
  const newResult =  {createUsers: [{id: '123', name: 'aman'}, {id: '456', name: 'Mike'}]}
```
Also, it aligns to the data structure returned by the graphql query 😃.
