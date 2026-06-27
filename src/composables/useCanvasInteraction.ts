import { inject, ref } from 'vue';
import type { Ref } from 'vue';
import { useCanvasStore } from '@/store/canvas';
import { IS_PREVIEW_KEY } from '@/views/Canvas/contants';

/**
 * 画布元素交互 composable
 * 统一处理点击选中、拖拽等交互，内置预览模式守卫
 * 新的画布元素只需使用此 composable 即可自动获得预览模式拦截
 */
export function useCanvasInteraction(
  id: string,
) {
  const canvasStore = useCanvasStore();
  const isPreview = inject(IS_PREVIEW_KEY, ref(false));

  /**
   * 画布操作守卫
   * 预览模式下自动拦截，非预览模式正常执行
   * 后续新增画布操作只需用 guard 包装即可自动获得预览拦截
   */
  function guard<T extends (...args: any[]) => any>(fn: T): (...args: Parameters<T>) => ReturnType<T> | undefined {
    return (...args: Parameters<T>) => {
      if (isPreview.value) return;
      return fn(...args);
    };
  }

  /** 点击选中元素（已内置预览守卫） */
  const handleSelect = guard(() => canvasStore.selectElement(id));

  return { guard, handleSelect, isPreview };
}
