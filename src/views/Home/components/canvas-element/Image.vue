<!-- ? 画布图片元素 -->
<template>
    <img :id="data.id" :class="data.classes" :src="data.src" :alt="data.title">
</template>

<script lang="ts" setup>
import { CanvasImageElement } from '../../types';

const data = defineModel<CanvasImageElement>("data", {
    required: true
});
</script>