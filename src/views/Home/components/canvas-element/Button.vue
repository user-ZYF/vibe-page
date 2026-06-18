<!-- ? 画布按钮元素 -->
<template>
    <button :class="data.classes" :id="data.id" :type="data.buttonType">{{ data.text }}</button>
</template>

<script lang="ts" setup>
import { CanvasButtonElement } from '../../types';

const data = defineModel<CanvasButtonElement>("data", {
    required: true
});
</script>