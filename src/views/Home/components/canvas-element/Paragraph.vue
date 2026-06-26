<!-- ? 画布段落元素 -->
<template>
    <p
        ref="paragraphEl"
        :id="data.id"
        :data-canvas-id="data.id"
        :class="data.classes"
        :style="style"
        :contenteditable="isEditing"
        :is-editing="isEditing"
        @click="canvasStore.selectElement(data.id)"
        @dblclick="handleDblClick"
        @blur="handleBlur"
        @keydown.enter="handleEnter"
    >{{ data.text }}</p>
</template>

<script lang="ts" setup>
import { ref, computed, nextTick } from 'vue';
import { CanvasParagraphElement } from '../../types';
import { useElementStyle } from '@/composables/useElementStyle';
import { useCanvasStore } from '@/store/canvas';
import { useDragConnector } from '../../drag/useDragConnector';
import { useInteractionBinder } from '@/composables/useInteractionBinder';
import { useElementVisibility } from '@/composables/useElementVisibility';

const canvasStore = useCanvasStore();

const data = defineModel<CanvasParagraphElement>("data", {
    required: true
});

/** 样式对象（合并 class 选择器与 id 选择器样式） */
const style = useElementStyle(data);

/** 段落 DOM 引用 */
const paragraphEl = ref<HTMLElement>();

/** 是否正在编辑文本 */
const isEditing = ref(false);

/** 双击进入编辑模式 */
function handleDblClick() {
    isEditing.value = true;
    canvasStore.selectElement(data.value.id);
    nextTick(() => {
        const el = paragraphEl.value;
        if (!el) return;
        el.focus();
        const range = document.createRange();
        range.selectNodeContents(el);
        const selection = window.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
    });
}

/** 退出编辑模式并保存文本 */
function handleBlur() {
    if (!isEditing.value) return;
    isEditing.value = false;
    const el = paragraphEl.value;
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
    paragraphEl.value?.blur();
}

useElementVisibility(data.value.id, data);

useDragConnector(paragraphEl, data.value.id);
useInteractionBinder(paragraphEl, computed(() => data.value.interactions));
</script>