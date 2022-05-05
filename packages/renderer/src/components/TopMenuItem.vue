<template>
<li class="top-menu ant-menu-overflow-item ant-menu-item" @click="handleClick" :class="{'top-menu-item-select': isClick }">
  <div class="ant-menu-title-content">
    <slot></slot>
  </div>
  <div class="ant-submenu-content">
    <ul class="submenu-list">
      <slot name="submenu"></slot>
    </ul>
  </div>
</li>
</template>

<script>
  export default {
    name: 'top-menu-item',
    data () {
      return {
        isClick: false
      }
    },
    methods: {
      handleClick () {
        this.isClick = !this.isClick
      }
    }
  }
</script>
<style>
  .ant-menu-dark.ant-menu-horizontal >.top-menu.ant-menu-item{
    padding: 0;
  }
  .top-menu.ant-menu-item .ant-menu-title-content {
    padding: 0 20px;
  }
  .top-menu.top-menu-item-select .ant-submenu-content{
    display: block;
  }
  .ant-submenu-content {
    display: none;
    z-index: 199;
    background-color: #001529;
    padding: 10px 0;
  }
</style>
