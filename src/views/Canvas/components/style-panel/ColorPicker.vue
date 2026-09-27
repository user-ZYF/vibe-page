<!-- ? 颜色选择器：点击色块弹出取色面板 -->
<template>
  <a-popover
    v-model:open="isOpen"
    trigger="click"
    placement="bottomRight"
    :arrow="false"
    overlay-class-name="comp-color-picker-popover"
  >
    <template #content>
      <Vue3ColorPicker
        v-if="isOpen"
        v-model="model"
        mode="solid"
        :theme="isDark ? 'dark' : 'light'"
        type="HEX8"
        :show-color-list="false"
        :show-picker-mode="false"
      />
    </template>
    <button type="button" class="color-picker-trigger" :class="{ 'color-picker-trigger--small': small }">
      <span class="color-picker-swatch" :style="{ background: model || 'transparent' }"></span>
    </button>
  </a-popover>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, ref, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { Vue3ColorPicker } from '@cyhnkckali/vue3-color-picker';
import '@cyhnkckali/vue3-color-picker/dist/style.css';
import { useThemeStore } from '@/store/theme';
import { useCanvasStore } from '@/store/canvas';

defineOptions({
  name: 'ColorPicker',
});

defineProps({
  /** 是否使用小尺寸色块 */
  small: {
    type: Boolean,
    default: false,
  },
});

/** 颜色值 */
const model = defineModel<string>({ default: '' });

const { isDark } = storeToRefs(useThemeStore());

const canvasStore = useCanvasStore();

/** 取色面板是否打开 */
const isOpen = ref(false);

/**
 * 面板开关联动 store 计数
 * 打开期间 StylePanel 挂起规则回读重建：拖拽取色时每帧都会写回规则，
 * 重建引发的重渲染会卸载取色器 DOM，导致其遗留的拖拽监听器读到空引用；
 * 使用计数而非布尔标记，避免多个取色器实例互相清除状态
 */
watch(isOpen, (open) => {
  canvasStore.colorPickerOpenCount = Math.max(0, canvasStore.colorPickerOpenCount + (open ? 1 : -1));
});

/** 组件卸载时归还计数（如元素被删除时弹层随之销毁的场景） */
onBeforeUnmount(() => {
  if (isOpen.value) canvasStore.colorPickerOpenCount = Math.max(0, canvasStore.colorPickerOpenCount - 1);
});
</script>

<style scoped lang="less">
.color-picker-trigger {
  width: 32px;
  height: 24px;
  padding: 0;
  border: 1px solid var(--editor-border-strong);
  border-radius: var(--editor-radius-sm);
  cursor: pointer;
  flex-shrink: 0;
  overflow: hidden;
  /* 棋盘格底纹，便于识别透明度与未设置状态 */
  background: repeating-conic-gradient(#808080 0% 25%, #b3b3b3 0% 50%) 0 0 / 8px 8px;
  transition: transform 0.15s;

  &:hover {
    transform: scale(1.08);
  }

  &--small {
    width: 20px;
    height: 20px;
    margin-left: auto;
  }
}

.color-picker-swatch {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
