import { ref, type Ref } from 'vue';
import { useScroll } from '@vueuse/core';
import { nodeRegistry } from '@/views/Canvas/drag/NodeRegistry';

/** 画布滚动位置 */
export interface CanvasScrollPosition {
  /** 水平滚动偏移 */
  left: number;
  /** 垂直滚动偏移 */
  top: number;
}

/**
 * 画布滚动位置状态
 *
 * 绑定后为 useScroll 返回的可写 ref：读取为当前滚动位置，写入即滚动到对应位置
 */
export const canvasScroll = {
  /** 水平滚动位置 */
  left: ref(0),
  /** 垂直滚动位置 */
  top: ref(0),
};

/**
 * 将画布滚动容器绑定到共享滚动状态（Root.vue 挂载时调用）
 *
 * 注意：root 元素 id 变化会导致组件重建并重新绑定，因此每次都需替换为最新的 useScroll ref
 *
 * @returns 解绑函数，卸载时调用以重置共享状态，避免悬挂引用指向已分离的 DOM 元素
 */
export function bindCanvasScroll(el: Ref<HTMLElement | undefined>): () => void {
  const { x, y } = useScroll(el);
  canvasScroll.left = x;
  canvasScroll.top = y;

  /** 解绑：重置为初始 ref，避免共享状态残留对已卸载容器的引用 */
  return () => {
    canvasScroll.left = ref(0);
    canvasScroll.top = ref(0);
  };
}

/**
 * 将指定元素滚动到画布可视区域顶部（Layers 面板点击元素时调用）
 * @param id 画布元素 id，对应 DOM 上的 data-canvas-id
 * @param rootId 画布根元素 id（根元素 DOM 即滚动容器）
 */
export function scrollElementToCanvasTop(id: string, rootId: string) {
  const reg = nodeRegistry.get(id);
  const container = nodeRegistry.get(rootId)?.el;
  if (!reg || !container) return;
  const offsetTop =
    reg.el.getBoundingClientRect().top -
    container.getBoundingClientRect().top +
    container.scrollTop;
  container.scrollTo({ top: offsetTop, behavior: 'smooth' });
}
