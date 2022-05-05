<template>
  <Page-View>
    <router-view></router-view>
  </Page-View>
</template>
<script>
  import { defineComponent } from 'vue';
  import PageView from './components/PageView.vue'

  export default defineComponent({
    name: 'app',
    components: {
      PageView
    },
    mounted () {
      // fix  打包后 router默认路径并不能打开页面，必须手动指定跳转
      this.$router.push('/')
    }
  })
</script>

