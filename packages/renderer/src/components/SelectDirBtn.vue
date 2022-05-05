<template>
  <a-button @click="handleImport()">导入dicom文件</a-button>
</template>

<script>
  export default {
    name: 'select-dir-btn',
    data () {
      return {
        dirPath: '',
        fileList: []
      }
    },
    methods: {
      handleImport () {
        // 创建input标签
        const inputObj = document.createElement('input')
        // 设置属性
        inputObj.setAttribute('id', '_ef')
        inputObj.setAttribute('type', 'file')
        inputObj.setAttribute('style', 'visibility:hidden')
        inputObj.setAttribute('webkitdirectory', '')
        inputObj.setAttribute('directory', '')
        // 添加到DOM中
        document.body.appendChild(inputObj)
        // 添加事件监听器
        inputObj.addEventListener('change', this.updatePath)
        // 模拟点击
        inputObj.click()
      },
      updatePath () {
        debugger
        const inputObj = document.getElementById('_ef')
        const files = inputObj.files
        console.log(files)
        try {
          // 临时变量的值赋给输出路径
          // this.dirPath = files
          this.fileList = files
          this.$emit('select-path', this.fileList)
          // 移除事件监听器
          inputObj.removeEventListener('change', function () {})
          // 从DOM中移除input
          document.body.removeChild(inputObj)
        } catch (error) {
          console.log(error)
        }
      }
    }
  }
</script>
