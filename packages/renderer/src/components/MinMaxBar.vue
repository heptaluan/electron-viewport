<template>
  <div class="top-set-panel">
    <a-button type="text" @click="handleSizeMini">
      <template #icon><MinusOutlined /></template>
    </a-button>
    <a-button type="text" @click="handleFullScreen">
      <template #icon v-if="isMax"><SwitcherOutlined /></template>
      <template #icon v-else><BorderOutlined /></template>
    </a-button>
    <a-button type="text" @click="handleClose()">
      <template #icon><CloseOutlined /></template>
    </a-button>
  </div>
</template>

<script>
  import { defineComponent } from 'vue';
  import { ipcRenderer } from 'electron'
  import { MinusOutlined, SwitcherOutlined, CloseOutlined, BorderOutlined } from '@ant-design/icons-vue'

  export default defineComponent({
    name: 'MinMaxBar',
    components: {
      MinusOutlined,
      SwitcherOutlined,
      CloseOutlined,
      BorderOutlined
    },
    data () {
      return {
        isMax:  false
      }
    },
    setup() {

    },
    methods: {
      handleSizeMini () {
        ipcRenderer.send('min')
      },
      handleFullScreen () {
        this.isMax = !this.isMax
        ipcRenderer.send('max')
      },
      handleClose () {
        ipcRenderer.send('close')
      }
    }
  })
</script>
