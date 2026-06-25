<!-- CanvasContainer.vue -->
<template>
  <div class="container">
    abc
    <div ref="hostRef" class="canvas-host"></div>
    <CanvasApp/>
  </div>
</template> 

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { createApp } from 'vue'
import CanvasApp from './components/CanvasApp.vue'  // 画布内部的 Vue 根组件

const hostRef = ref(null)
let app = null
let shadowRoot = null

onMounted(() => {
  // 创建 Shadow Root
  shadowRoot = hostRef.value.attachShadow({ mode: 'open' })
  
  // 将 Vue 应用挂载到 Shadow Root 中
  app = createApp(CanvasApp)
  app.mount(shadowRoot) // Vue 3 支持挂载到 ShadowRoot
})

onUnmounted(() => {
  if (app) app.unmount()
})

// 如果你需要从外部向画布传递数据，可以使用 props / provide / 状态管理
// 这里直接通过 CanvasApp 的 props 传递即可（需要在挂载时传入）
</script>

<style>
.container{
  color: red;
}

button {
  background: green;
}

.canvas-host {
  all: revert;
}
</style>