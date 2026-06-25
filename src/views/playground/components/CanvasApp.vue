<!-- CanvasApp.vue -->
<template>
  <div class="canvas">
    <h1>画布内容</h1>
    <p>这里是一个完全隔离的环境</p>
    <button @click="count++">点击：{{ count }}</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
const count = ref(0)
</script>