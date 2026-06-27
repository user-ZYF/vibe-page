import { ref, computed } from 'vue';
import { useCanvasStore } from '@/store/canvas';
import { nodeRegistry } from '@/views/Canvas/drag/NodeRegistry';

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
  /** margin box距离画布左侧的距离 */
  x: number;
  /** margin box距离画布顶部的距离 */
  y: number;
}

/** 从 computed style 中解析 px 数值 */
function parsePx(value: string): number {
  return parseFloat(value) || 0;
}

/**
 * 画布元素盒模型定位 composable
 * 提供 box 数据、rootStyle 计算属性、updateBox 方法以及 scroll/resize 自动更新
 */
export function useCanvasBoxRect() {
  const canvasStore = useCanvasStore();

  /** 盒模型尺寸数据 */
  const elRect = ref<CanvasBoxRect>({
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

  /** 元素的margin盒 */
  const elMarginBox = computed(() => ({
    left: elRect.value.x + 'px',
    top: elRect.value.y + 'px',
    width:
      elRect.value.marginLeft +
      elRect.value.borderLeft +
      elRect.value.paddingLeft +
      elRect.value.contentWidth +
      elRect.value.paddingRight +
      elRect.value.borderRight +
      elRect.value.marginRight +
      'px',
    height:
      elRect.value.marginTop +
      elRect.value.borderTop +
      elRect.value.paddingTop +
      elRect.value.contentHeight +
      elRect.value.paddingBottom +
      elRect.value.borderBottom +
      elRect.value.marginBottom +
      'px',
  }));

  /** 根据 DOM 元素更新盒模型数据 */
  function updateBox(el: Element) {
    const canvasEl = getCanvasEl();
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

    /** 元素的margin box具体画布区域左上角坐标 */
    const x = rect.left - canvasRect.left - marginLeft;
    const y = rect.top - canvasRect.top - marginTop;

    elRect.value = {
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
      x,
      y,
    };
  }

  /** 重置元素尺寸数据 */
  function resetElRect() {
    elRect.value = {
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
    };
  }

  /** 获取画布根节点 DOM（通过 NodeRegistry 注册表获取） */
  function getCanvasEl(): Element | null {
    return nodeRegistry.get(canvasStore.root.id)?.el ?? null;
  }

  return {
    elRect,
    elMarginBox,
    updateBox,
    resetElRect,
    getCanvasEl,
  };
}
