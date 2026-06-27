import { onMounted, onBeforeUnmount, watch, type Ref } from 'vue';
import { InteractionEventEnum, InteractionActionEnum } from '@/constants/home';
import type { InteractionRule } from '@/views/Canvas/types';
import { nodeRegistry } from '@/views/Canvas/drag/NodeRegistry';

/** 事件枚举到 DOM 事件名的映射 */
const EVENT_MAP: Record<InteractionEventEnum, string> = {
  [InteractionEventEnum.CLICK]: 'click',
  [InteractionEventEnum.DOUBLE_CLICK]: 'dblclick',
  [InteractionEventEnum.MOUSE_ENTER]: 'mouseenter',
  [InteractionEventEnum.MOUSE_LEAVE]: 'mouseleave',
};

/**
 * 根据交互规则创建事件处理器
 */
function createHandler(rule: InteractionRule) {
  return function (this: HTMLElement, e: Event) {
    const target = rule.targetId
      ? nodeRegistry.get(rule.targetId)?.el ?? null
      : (e.currentTarget as HTMLElement);
    if (!target) return;

    switch (rule.action) {
      case InteractionActionEnum.SHOW:
        target.style.display = '';
        break;
      case InteractionActionEnum.HIDE:
        target.style.display = 'none';
        break;
      case InteractionActionEnum.TOGGLE_VISIBILITY: {
        const current = target.style.display;
        target.style.display = current === 'none' ? '' : 'none';
        break;
      }
      case InteractionActionEnum.TOGGLE_CLASS: {
        const cls = rule.params.className;
        if (cls) {
          target.classList.toggle(cls);
        }
        break;
      }
      case InteractionActionEnum.NAVIGATE: {
        const url = rule.params.url;
        if (url) {
          window.open(url, '_blank');
        }
        break;
      }
    }
  };
}

/**
 * 将交互规则绑定到 DOM 元素上
 * @param elRef 元素 DOM 引用
 * @param interactions 交互规则（响应式）
 */
export function useInteractionBinder(
  elRef: Ref<HTMLElement | undefined>,
  interactions: Ref<InteractionRule[]>,
) {
  /** 存储当前绑定的清理函数 */
  let cleanupFns: (() => void)[] = [];

  /** 绑定所有规则 */
  function bind() {
    unbind();
    const el = elRef.value;
    if (!el || !interactions.value.length) return;

    interactions.value.forEach((rule) => {
      const eventName = EVENT_MAP[rule.event];
      if (!eventName) return;
      const handler = createHandler(rule);
      el.addEventListener(eventName, handler);
      cleanupFns.push(() => el.removeEventListener(eventName, handler));
    });
  }

  /** 解绑所有规则 */
  function unbind() {
    cleanupFns.forEach((fn) => fn());
    cleanupFns = [];
  }

  onMounted(() => {
    bind();
  });

  onBeforeUnmount(() => {
    unbind();
  });

  /** 监听规则变化，重新绑定 */
  watch(
    () => interactions.value,
    () => bind(),
    { deep: true },
  );
}
