<template>
 <div class="page-view">
   <a-layout class="layout">
     <a-layout-header class="layout-header">
       <top-bar></top-bar>
     </a-layout-header>
     <a-layout-content class="layout-content">
       <slot></slot>
     </a-layout-content>
   </a-layout>
 </div>
</template>

<script>
  import { defineComponent } from 'vue';
  import TopBar from '../components/TopBar.vue'
  export default defineComponent({
    name: 'PageView',
    components: {
      TopBar
    }
  })
</script>
