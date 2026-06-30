<!-- ? 三级标题元素 -->
<template>
    <h3
        ref="headingEl"
        :id="data.id"
        :data-canvas-id="data.id"
        :class="data.classes"
        :style="style"
        :contenteditable="isEditing"
        :is-editing="isEditing"
        @click.stop="handleSelect"
        @dblclick="handleDblClick"
        @blur="handleBlur"
        @keydown.enter="handleEnter"
    >{{ data.text }}</h3>
</template>

<script lang="ts" setup>
import { ref, nextTick } from 'vue';
import { CanvasHeading3Element } from '../../types';
import { useElementStyle } from '@/composables/useElementStyle';
import { useCanvasStore } from '@/store/canvas';
import { useCanvasInteraction } from '@/composables/useCanvasInteraction';
import { useDragConnector } from '../../drag/useDragConnector';
import { useElementVisibility } from '@/composables/useElementVisibility';

const canvasStore = useCanvasStore();

const data = defineModel<CanvasHeading3Element>("data", {
    required: true
});

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

/** 标题 DOM 引用 */
const headingEl = ref<HTMLElement>();

/** 是否正在编辑文本 */
const isEditing = ref(false);

const { handleSelect, guard } = useCanvasInteraction(data.value.id);

useDragConnector(headingEl, data.value.id);

/** 双击进入编辑模式（已内置预览守卫） */
const handleDblClick = guard(() => {
    isEditing.value = true;
    canvasStore.selectElement(data.value.id);
    nextTick(() => {
        const el = headingEl.value;
        if (!el) return;
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    });
});

/** 退出编辑模式并保存文本 */
function handleBlur() {
    if (!isEditing.value) return;
    isEditing.value = false;
    const el = headingEl.value;
    if (!el) return;
    const newText = el.innerText.trim();
    if (newText !== data.value.text) {
        data.value.text = newText;
    }
}

/** 按下 Enter 键退出编辑模式（Shift+Enter 换行） */
function handleEnter(e: KeyboardEvent) {
    if (e.shiftKey) return;
    e.preventDefault();
    headingEl.value?.blur();
}

useElementVisibility(data.value.id, data);
</script>
