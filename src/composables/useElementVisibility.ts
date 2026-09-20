import { inject, onBeforeUnmount, watch, type Ref } from 'vue';
import { HIDDEN_KEYS } from '@/views/Canvas/constants';
import { useCanvasStore } from '@/store/canvas';

/** 存储元素隐藏前的原始 display 声明值（含可能未在 styleConfig 中表达的 grid 等值） */
const originalDisplayMap = new Map<string, string | undefined>();

/**
 * 画布元素可见性控制
 * 通过直写元素 #id 规则的 display 声明来控制显示/隐藏（style 为全量声明的事实来源），
 * 恢复时还原隐藏前的值；同步 diff 仅在面板修改 styleConfig 时写回，直写的声明不受影响
 */
export function useElementVisibility(elementId: string) {
  const canvasStore = useCanvasStore();
  const hiddenKeys = inject<Ref<string[]>>(HIDDEN_KEYS)!;

  const stopWatch = watch(
    () => hiddenKeys.value.includes(elementId),
    (isHidden) => {
      const selector = `#${elementId}`;
      if (isHidden) {
        // 保存隐藏前的 display 后设置为 none
        originalDisplayMap.set(elementId, canvasStore.getRawStyleDeclaration(selector, 'display'));
        canvasStore.setRawStyleDeclaration(selector, 'display', 'none');
      } else if (originalDisplayMap.has(elementId)) {
        /** 还原隐藏前的 display 值 */
        canvasStore.setRawStyleDeclaration(selector, 'display', originalDisplayMap.get(elementId));
        originalDisplayMap.delete(elementId);
      }
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    stopWatch();
    /** 元素卸载（删除/合并/清空）时清理隐藏前的 display 记录，避免模块级 Map 残留 */
    originalDisplayMap.delete(elementId);
  });
}
