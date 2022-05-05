<template>
<div class="top-bar">
  <div class="top-logo">
    <img src="http://vuejs.org/images/logo.png" class="top-logo-image">
  </div>
  <div class="top-menu-panel">
    影像处理软件
  </div>
  <min-max-bar></min-max-bar>
</div>
</template>

<script>
import TopMenuItem from './TopMenuItem.vue'
import MinMaxBar from './MinMaxBar.vue'

export default {
  name: 'top-bar',
  components: {
    MinMaxBar,
    TopMenuItem
  }
}
</script>
