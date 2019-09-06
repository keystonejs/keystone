<template>
  <div>
    <main-nav />
    <h1>This is the About page</h1>
  </div>
</template>

<script>
import MainNav from '../components/main-nav';
export default {
  head: {
    title: 'About page',
  },
  components: {
    MainNav,
  },
};
</script>