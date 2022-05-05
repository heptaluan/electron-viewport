<template>
 <div class="page-login">
   <div class="login-content">
     <a-button @click="login">
       登陆
     </a-button>
   </div>
 </div>
</template>

<script>
  import { defineComponent } from 'vue';
  // import { ipcRenderer } from '@/electron';

  export default defineComponent({
    name: 'LoginPage',
    components: {
    },
    setup() {

    },
    methods: {
      login () {
        this.$router.push({name: 'MainPage'})
      }
    }
  })
</script>
