import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import { createApp, defineComponent, h } from 'vue';
import { useRafThrottle } from '@/composables/useRafThrottle';

/** 手动控制的 rAF 回调队列（id -> 回调） */
let rafCallbacks: Map<number, FrameRequestCallback>;
/** rAF 句柄自增计数 */
let nextRafId: number;

/** 执行并清空当前所有挂起的 rAF 回调 */
function flushRaf() {
  const callbacks = [...rafCallbacks.values()];
  rafCallbacks.clear();
  callbacks.forEach((cb) => cb(0));
}

beforeEach(() => {
  rafCallbacks = new Map();
  nextRafId = 1;
  vi.stubGlobal('requestAnimationFrame', (cb: FrameRequestCallback) => {
    const id = nextRafId++;
    rafCallbacks.set(id, cb);
    return id;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    rafCallbacks.delete(id);
  });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

/** 在组件内挂载 useRafThrottle，返回触发函数与卸载方法 */
function mountThrottled(fn: () => void) {
  let trigger!: () => void;
  const app = createApp(
    defineComponent({
      setup() {
        trigger = useRafThrottle(fn);
        return () => h('div');
      },
    }),
  );
  app.mount(document.createElement('div'));
  return { trigger, unmount: () => app.unmount() };
}

describe('useRafThrottle', () => {
  it('同帧内多次触发只执行一次回调', () => {
    const fn = vi.fn();
    const { trigger } = mountThrottled(fn);

    trigger();
    trigger();
    trigger();
    flushRaf();

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('回调执行后可再次调度', () => {
    const fn = vi.fn();
    const { trigger } = mountThrottled(fn);

    trigger();
    flushRaf();
    trigger();
    flushRaf();

    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('组件卸载时取消未执行的回调', () => {
    const fn = vi.fn();
    const { trigger, unmount } = mountThrottled(fn);

    trigger();
    unmount();
    flushRaf();

    expect(fn).not.toHaveBeenCalled();
  });
});
