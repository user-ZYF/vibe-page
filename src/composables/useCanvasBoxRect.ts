import { ref, computed } from 'vue';

/** 盒模型尺寸数据 */
export interface CanvasBoxRect {
  /** 上外边距 */
  marginTop: number;
  /** 右外边距 */
  marginRight: number;
  /** 下外边距 */
  marginBottom: number;
  /** 左外边距 */
  marginLeft: number;
  /** 上内边距 */
  paddingTop: number;
  /** 右内边距 */
  paddingRight: number;
  /** 下内边距 */
  paddingBottom: number;
  /** 左内边距 */
  paddingLeft: number;
  /** 上边框 */
  borderTop: number;
  /** 右边框 */
  borderRight: number;
  /** 下边框 */
  borderBottom: number;
  /** 左边框 */
  borderLeft: number;
  /** 内容区宽度 */
  contentWidth: number;
  /** 内容区高度 */
  contentHeight: number;
  /** 包含 margin 的整体区域左上角 x（相对于画布容器） */
  x: number;
  /** 包含 margin 的整体区域左上角 y（相对于画布容器） */
  y: number;
}

/** 默认盒模型数据 */
const defaultBox = (): CanvasBoxRect => ({
  marginTop: 0,
  marginRight: 0,
  marginBottom: 0,
  marginLeft: 0,
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 0,
  paddingLeft: 0,
  borderTop: 0,
  borderRight: 0,
  borderBottom: 0,
  borderLeft: 0,
  contentWidth: 0,
  contentHeight: 0,
  x: 0,
  y: 0,
});

/** 从 computed style 中解析 px 数值 */
function parsePx(value: string): number {
  return parseFloat(value) || 0;
}

/**
 * 画布元素盒模型定位 composable
 * 提供 box 数据、rootStyle 计算属性、updateBox 方法以及 scroll/resize 自动更新
 */
export function useCanvasBoxRect() {
  /** 盒模型尺寸数据 */
  const box = ref<CanvasBoxRect>(defaultBox());

  /** 覆盖层根节点的定位样式（含 margin 的完整区域） */
  const rootStyle = computed(() => ({
    left: box.value.x + 'px',
    top: box.value.y + 'px',
    width:
      box.value.marginLeft +
      box.value.borderLeft +
      box.value.paddingLeft +
      box.value.contentWidth +
      box.value.paddingRight +
      box.value.borderRight +
      box.value.marginRight +
      'px',
    height:
      box.value.marginTop +
      box.value.borderTop +
      box.value.paddingTop +
      box.value.contentHeight +
      box.value.paddingBottom +
      box.value.borderBottom +
      box.value.marginBottom +
      'px',
  }));

  /** 根据 DOM 元素更新盒模型数据 */
  function updateBox(el: Element) {
    const canvasEl = document.querySelector('.canvas-container');
    if (!canvasEl) return;

    const rect = el.getBoundingClientRect();
    const canvasRect = canvasEl.getBoundingClientRect();
    const style = getComputedStyle(el);

    const marginTop = parsePx(style.marginTop);
    const marginRight = parsePx(style.marginRight);
    const marginBottom = parsePx(style.marginBottom);
    const marginLeft = parsePx(style.marginLeft);

    const borderTop = parsePx(style.borderTopWidth);
    const borderRight = parsePx(style.borderRightWidth);
    const borderBottom = parsePx(style.borderBottomWidth);
    const borderLeft = parsePx(style.borderLeftWidth);

    const paddingTop = parsePx(style.paddingTop);
    const paddingRight = parsePx(style.paddingRight);
    const paddingBottom = parsePx(style.paddingBottom);
    const paddingLeft = parsePx(style.paddingLeft);

    const contentWidth = rect.width - borderLeft - borderRight - paddingLeft - paddingRight;
    const contentHeight = rect.height - borderTop - borderBottom - paddingTop - paddingBottom;

    /** 覆盖层整体左上角坐标（含 margin，相对于画布容器） */
    const rootX = rect.left - canvasRect.left - marginLeft;
    const rootY = rect.top - canvasRect.top - marginTop;

    box.value = {
      marginTop,
      marginRight,
      marginBottom,
      marginLeft,
      borderTop,
      borderRight,
      borderBottom,
      borderLeft,
      paddingTop,
      paddingRight,
      paddingBottom,
      paddingLeft,
      contentWidth: Math.max(0, contentWidth),
      contentHeight: Math.max(0, contentHeight),
      x: rootX,
      y: rootY,
    };
  }

  /** 重置盒模型数据 */
  function resetBox() {
    box.value = defaultBox();
  }

  /** 获取画布容器 DOM */
  function getCanvasEl(): Element | null {
    return document.querySelector('.canvas-container');
  }

  return {
    box,
    rootStyle,
    updateBox,
    resetBox,
    getCanvasEl,
  };
}
