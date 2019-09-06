<template>
  <ul>
    <li>
      <nuxt-link to="/">Home</nuxt-link>
    </li>
    <li>
      <nuxt-link to="/about">About</nuxt-link>
    </li>
  </ul>
</template>

<style>
ul {
  list-style: none;
  padding: 0;
  display: flex;
}
a {
  margin-right: 0.5rem;
  text-decoration: none;
}

a:hover,
a.nuxt-link-exact-active {
  border-bottom: solid 2px;
}
</style>