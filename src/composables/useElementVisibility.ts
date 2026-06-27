import { inject, onBeforeUnmount, watch, type Ref } from 'vue';
import { HIDDEN_KEYS } from '@/views/Canvas/contants';
import { DisplayStyleEnum } from '@/constants/style';
import type { StyleConfig } from '@/views/Canvas/types';

/** 存储元素隐藏前的原始 display 值 */
const originalDisplayMap = new Map<string, DisplayStyleEnum | undefined>();

/**
 * 画布元素可见性控制
 * 通过修改元素 styleConfig.general.display 来控制显示/隐藏，
 * 恢复时还原隐藏前的 display 值
 */
export function useElementVisibility(
  elementId: string,
  data: Ref<{ styleConfig: StyleConfig }>,
) {
  const hiddenKeys = inject<Ref<string[]>>(HIDDEN_KEYS)!;

  const stopWatch = watch(
    () => hiddenKeys.value.includes(elementId),
    (isHidden) => {
      if (isHidden) {
        /** 保存当前 display 值后设置为 none */
        const currentDisplay = data.value.styleConfig.general.display;
        originalDisplayMap.set(elementId, currentDisplay);
        data.value.styleConfig.general.display = DisplayStyleEnum.NONE;
      } else {
        /** 还原隐藏前的 display 值 */
        if (originalDisplayMap.has(elementId)) {
          const originalDisplay = originalDisplayMap.get(elementId);
          data.value.styleConfig.general.display = originalDisplay;
          originalDisplayMap.delete(elementId);
        }
      }
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    stopWatch();
  });
}
