<template>
    <div ref="containerRef">
      <div class="item" v-for="item in list" :key="item.name" :item="item">
        <div>{{ item.name }}</div>
        <draggable v-model="item.children" />
      </div>
    </div>
</template>
<script setup lang="ts">
import { useDraggable } from 'vue-draggable-plus'
import { ref } from 'vue'
import draggable from './draggable.vue';

defineOptions({
    name: 'draggable'
});

interface IList {
  name: string
  children: IList[]
}

const list = defineModel<IList[]>();

const containerRef = ref<HTMLDivElement>();

useDraggable(containerRef, list, {
  animation: 100,
  group: 'g1'
});
</script>
<style scoped>
div{
  outline: 1px dashed #ccc;
}

.item {
  padding-left: 20px;
}
</style>