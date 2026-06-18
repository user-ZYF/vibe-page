<!-- ? 容器组件 -->
<template>
  <div :class="data.classes" :id="data.id">
    <component :is="CanvasElementComponentMap[child.type]" v-for="(child, index) in data.children" :key="child.id" v-model:data="data.children[index]"/>
  </div>
</template>

<script lang="ts" setup>
import { CanvasContainerElement } from '../../types';
import { CanvasElementComponentMap } from '../../contants';

const data = defineModel<CanvasContainerElement>("data", {
  required: true
});
</script>
