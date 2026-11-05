<!-- ? 远程标记层 -->
<template>
  <div class="remote-selections">
    <div
      v-for="item in selectionRects"
      :key="item.elementId"
      class="remote-selection"
      :style="{
        left: item.x + 'px',
        top: item.y + 'px',
        width: item.width + 'px',
        height: item.height + 'px',
        outlineColor: item.color,
      }"
    >
      <span class="remote-selection-tag" :style="{ backgroundColor: item.color }">
        {{ item.members.map((m) => m.nickname).join('、') }}
      </span>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, shallowRef, watch, onBeforeUnmount, nextTick } from 'vue';
import { storeToRefs } from 'pinia';
import { useResizeObserver, useEventListener } from '@vueuse/core';
import { useCollabStore } from '@/store/collab';
import { useCanvasStore } from '@/store/canvas';
import { getCanvasEl } from '@/composables/useCanvasBoxRect';
import { useRafThrottle } from '@/composables/useRafThrottle';
import { nodeRegistry } from '@/views/Canvas/drag/NodeRegistry';
import type { RemoteSelectionRect } from '@/views/Canvas/types';
import { memberColor } from '@/utils/member-color';

defineOptions({
  name: 'RemoteSelections',
});

const collabStore = useCollabStore();
const canvasStore = useCanvasStore();
const { selections, selfUserId } = storeToRefs(collabStore);
const { root, styleRules } = storeToRefs(canvasStore);

/** 各远程选中元素的展示矩形 */
const selectionRects = ref<RemoteSelectionRect[]>([]);

/** 重新计算所有远程选中元素的屏幕位置 */
function updateRects() {
  const canvasEl = getCanvasEl();
  if (!canvasEl) {
    selectionRects.value = [];
    return;
  }
  const canvasRect = canvasEl.getBoundingClientRect();
  const list: RemoteSelectionRect[] = [];
  for (const [elementId, users] of selections.value) {
    // 元素可能刚被远程删除、DOM 尚未卸载，未注册时静默跳过
    const el = nodeRegistry.get(elementId)?.el;
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    const members = users.filter((m) => m.userId !== selfUserId.value);
    if (!members.length) continue;
    list.push({
      elementId,
      x: rect.left - canvasRect.left,
      y: rect.top - canvasRect.top,
      width: rect.width,
      height: rect.height,
      color: memberColor(members[0].userId),
      members,
    });
  }
  selectionRects.value = list;
}

/** 帧节流重算位置：rAF 在绘制前执行，此时 Vue 已完成本轮 DOM 更新，可测得最新位置 */
const scheduleUpdateRects = useRafThrottle(updateRects);

/** 监听选中标记表与画布内容（位置随内容变化） */
watch([selections, root, styleRules], scheduleUpdateRects, { deep: true });

/** 画布根 DOM（onMounted 后从注册表获取，驱动事件监听目标） */
const canvasElRef = shallowRef<HTMLElement | null>(null);

/** 画布根 DOM 尺寸变化（侧栏开合、窗口缩放等） */
useResizeObserver(canvasElRef, scheduleUpdateRects);

/** 绑定画布根 DOM（immediate 时 nextTick 执行于挂载完成后，可测得最新位置；根元素 id 重建后重新绑定） */
watch(
  () => root.value.id,
  () => {
    nextTick(() => {
      canvasElRef.value = getCanvasEl() as HTMLElement | null;
      updateRects();
    });
  },
  { immediate: true },
);

/** 滚动（子孙元素滚动不冒泡，需捕获阶段监听）与窗口尺寸变化 */
useEventListener(canvasElRef, 'scroll', scheduleUpdateRects, true);
useEventListener(window, 'resize', scheduleUpdateRects);

onBeforeUnmount(() => {
  selectionRects.value = [];
});
</script>

<style scoped lang="less">
.remote-selections {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.remote-selection {
  position: absolute;
  outline: 1px solid;
  outline-offset: -1px;
  pointer-events: none;

  &-tag {
    position: absolute;
    top: -18px;
    left: 0;
    padding: 0 4px;
    font-size: 12px;
    font-family: monospace;
    line-height: 1.5;
    color: #fff;
    white-space: nowrap;
  }
}
</style>
