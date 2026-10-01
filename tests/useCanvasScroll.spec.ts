import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scrollElementToCanvasTop } from '@/composables/useCanvasScroll';
import { nodeRegistry } from '@/views/Canvas/drag/NodeRegistry';

/**
 * scrollElementToCanvasTop 单测
 *
 * 验证：根据元素与画布根元素（滚动容器）的相对位置计算偏移，并平滑滚动到顶部
 */

/** 创建指定 rect 的 mock 元素 */
function createEl(top: number): HTMLElement {
  const el = document.createElement('div');
  vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    top,
    bottom: 0,
    left: 0,
    right: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
    toJSON: () => ({}),
  } as DOMRect);
  return el;
}

beforeEach(() => {
  /** 清空注册表，避免用例间相互影响 */
  for (const node of nodeRegistry.getAll()) {
    nodeRegistry.unregister(node.id);
  }
});

describe('scrollElementToCanvasTop', () => {
  it('将元素滚动到画布可视区域顶部', () => {
    const container = createEl(100);
    const scrollTo = vi.fn();
    container.scrollTo = scrollTo;
    /** 模拟容器已向下滚动 50px */
    Object.defineProperty(container, 'scrollTop', { value: 50, configurable: true });
    nodeRegistry.register('root', container, true);

    const target = createEl(300);
    nodeRegistry.register('el-1', target, false);

    scrollElementToCanvasTop('el-1', 'root');

    /** 偏移 = 元素top(300) - 容器top(100) + 已滚动量(50) */
    expect(scrollTo).toHaveBeenCalledWith({ top: 250, behavior: 'smooth' });
  });

  it('元素未注册时不执行滚动', () => {
    const container = createEl(0);
    const scrollTo = vi.fn();
    container.scrollTo = scrollTo;
    nodeRegistry.register('root', container, true);

    scrollElementToCanvasTop('not-exist', 'root');

    expect(scrollTo).not.toHaveBeenCalled();
  });

  it('根元素未注册时不执行滚动', () => {
    const target = createEl(300);
    nodeRegistry.register('el-1', target, false);

    /** 注册表中无 rootId 对应节点时不应抛错 */
    expect(() => scrollElementToCanvasTop('el-1', 'root')).not.toThrow();
  });
});
