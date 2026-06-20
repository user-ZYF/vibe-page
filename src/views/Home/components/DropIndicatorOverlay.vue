<!-- ? 拖拽落点占位线覆盖层 -->
<template>
  <div
    v-if="indicator && !indicator.error"
    class="drop-indicator-overlay"
    :class="{ 'is-error': indicator.error }"
    :style="indicatorStyle"
  ></div>
</template>

<script lang="ts" setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useDragStore } from "@/store/drag";

defineOptions({
  name: "DropIndicatorOverlay",
});

const dragStore = useDragStore();
const { indicator } = storeToRefs(dragStore);

/** 根据 indicator.rect 计算 fixed 定位样式 */
const indicatorStyle = computed(() => {
  if (!indicator.value) return {};
  const { top, left, width, height } = indicator.value.rect;
  return {
    top: `${top}px`,
    left: `${left}px`,
    width: `${width}px`,
    height: `${height}px`,
  };
});
</script>

<style scoped lang="less">
.drop-indicator-overlay {
  position: fixed;
  z-index: 9999;
  background-color: #1677ff;
  pointer-events: none;
  border-radius: 1px;

  &.is-error {
    background-color: #ff4d4f;
  }
}
</style>
