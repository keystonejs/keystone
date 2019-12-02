# @westpac/hooks

## Motivation

React doesn’t offer a way to “attach” reusable behavior to a component (for
example, connecting it to a store). If you’ve worked with React for a while, you
may be familiar with patterns like render props and higher-order components that
try to solve this. But these patterns require you to restructure your components
when you use them, which can be cumbersome and make code harder to follow.

With Hooks, you can extract stateful logic from a component so it can be tested
independently and reused. **Hooks allow you to reuse stateful logic without
changing your component hierarchy.** This makes it easy to share Hooks among
many components.
