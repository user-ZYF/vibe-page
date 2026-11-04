import { onBeforeUnmount } from 'vue';

/**
 * rAF 帧节流：高频触发合并为每帧最多一次回调，组件卸载时自动取消未执行的回调
 * @param fn 节流的回调
 * @returns 节流后的触发函数
 */
export function useRafThrottle(fn: () => void): () => void {
  /** 待执行的 rAF 句柄 */
  let rafId: number | null = null;

  onBeforeUnmount(() => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  });

  return () => {
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      fn();
    });
  };
}
