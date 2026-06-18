<!-- ? 画布段落元素 -->
<template>
    <p :id="data.id" :class="data.classes">{{ data.text }}</p>
</template>

<script lang="ts" setup>
import { CanvasParagraphElement } from '../../types';

const data = defineModel<CanvasParagraphElement>("data", {
    required: true
});
</script>