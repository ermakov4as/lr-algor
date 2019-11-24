<template>
  <div id="app">
    <Algoritm />
  </div>
</template>

<script>
import Algoritm from './components/Algoritm.vue'

export default {
  name: 'app',
  components: {
    Algoritm
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  /* text-align: center; */
  color: #2c3e50;
  margin-top: 30px;
  margin-left: 30px;
  /* background: url('./assets/sm7-31m.jpg') center; */
  /* background-repeat: no-repeat; */
}
</style>
