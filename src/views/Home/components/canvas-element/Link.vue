<!-- ? 画布超链接元素 -->
<template>
    <a :id="data.id" :class="data.classes" :href="data.href">{{ data.text }}</a>
</template>

<script lang="ts" setup>
import { CanvasLinkElement } from '../../types';

const data = defineModel<CanvasLinkElement>("data", {
    required: true
});
</script>