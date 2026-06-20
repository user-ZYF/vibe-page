<template>
  <VueDraggable class="drag-area" tag="ul" v-model="list" group="g1">
    <li v-for="(el, index) in modelValue" :key="index">
      <p>{{ el.tag }}</p>
      <nested-component v-model="el.children" />
    </li>
  </VueDraggable>
</template>
<script setup lang="ts">
import { VueDraggable } from 'vue-draggable-plus'
import { List } from '../types';

const list = defineModel<List[]>()
</script>
<style scoped>
.drag-area {
  min-height: 50px;
  outline: 1px dashed;
}
</style>