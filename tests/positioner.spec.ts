import { describe, it, expect } from 'vitest';
import { findDropPosition } from '@/views/Canvas/drag/Positioner';
import type { NodeInfo } from '@/views/Canvas/drag/types';
import { DropPositionEnum } from '@/constants/home';
import { LayoutModeEnum } from '@/constants/style';

/** 构造子元素维度信息 */
function mkInfo(
  id: string,
  childIndex: number,
  mode: LayoutModeEnum,
  left: number,
  top: number,
  width: number,
  height: number,
  reversed = false
): NodeInfo {
  return {
    id,
    childIndex,
    mode,
    reversed,
    left,
    top,
    right: left + width,
    bottom: top + height,
    outerWidth: width,
    outerHeight: height,
  };
}

/** 纯纵向流子元素（宽 800，各高 100，依次堆叠） */
function mkVerticalStack(): NodeInfo[] {
  return [
    mkInfo('A', 0, LayoutModeEnum.VERTICAL, 0, 0, 800, 100),
    mkInfo('B', 1, LayoutModeEnum.VERTICAL, 0, 100, 800, 100),
    mkInfo('C', 2, LayoutModeEnum.VERTICAL, 0, 200, 800, 100),
  ];
}

/** 单行横向子元素（高 100，各宽 100，依次排列） */
function mkHorizontalRow(): NodeInfo[] {
  return [
    mkInfo('A', 0, LayoutModeEnum.HORIZONTAL, 0, 0, 100, 100),
    mkInfo('B', 1, LayoutModeEnum.HORIZONTAL, 100, 0, 100, 100),
    mkInfo('C', 2, LayoutModeEnum.HORIZONTAL, 200, 0, 100, 100),
  ];
}

describe('findDropPosition', () => {
  describe('无常规流锚点', () => {
    it('空容器 → 无锚点，插到容器开头', () => {
      const result = findDropPosition([], 100, 100);
      expect(result.anchor).toBeNull();
      expect(result.where).toBe(DropPositionEnum.BEFORE);
    });

    it('全部为脱流元素 → 无锚点，插到容器开头', () => {
      const dims = [
        mkInfo('X', 0, LayoutModeEnum.FREE, 10, 10, 50, 50),
        mkInfo('Y', 1, LayoutModeEnum.FREE, 200, 200, 50, 50),
      ];
      const result = findDropPosition(dims, 220, 220);
      expect(result.anchor).toBeNull();
      expect(result.where).toBe(DropPositionEnum.BEFORE);
    });

    it('脱流元素不作锚点：常规流与脱流混合时只参照常规流元素', () => {
      const dims = [
        mkInfo('A', 0, LayoutModeEnum.VERTICAL, 0, 0, 800, 100),
        mkInfo('X', 1, LayoutModeEnum.FREE, 400, 500, 50, 50),
      ];
      // 鼠标贴近脱流元素 X，锚点仍只能是 A
      const result = findDropPosition(dims, 420, 520);
      expect(result.anchor?.id).toBe('A');
      expect(result.where).toBe(DropPositionEnum.AFTER);
    });
  });

  describe('纵向流', () => {
    it('鼠标在元素垂直中心上方 → BEFORE', () => {
      const result = findDropPosition(mkVerticalStack(), 400, 30);
      expect(result.anchor?.id).toBe('A');
      expect(result.where).toBe(DropPositionEnum.BEFORE);
    });

    it('鼠标在元素垂直中心下方 → AFTER', () => {
      const result = findDropPosition(mkVerticalStack(), 400, 80);
      expect(result.anchor?.id).toBe('A');
      expect(result.where).toBe(DropPositionEnum.AFTER);
    });

    it('鼠标在所有元素上方 → BEFORE 第一个元素', () => {
      const result = findDropPosition(mkVerticalStack(), 400, -20);
      expect(result.anchor?.id).toBe('A');
      expect(result.where).toBe(DropPositionEnum.BEFORE);
    });

    it('鼠标在所有元素下方 → AFTER 最后一个元素', () => {
      const result = findDropPosition(mkVerticalStack(), 400, 350);
      expect(result.anchor?.id).toBe('C');
      expect(result.where).toBe(DropPositionEnum.AFTER);
    });

    it('相邻元素接缝处距离相等 → 偏向 DOM 靠后的元素', () => {
      // y=100 恰好是 A.bottom 与 B.top 的接缝
      const result = findDropPosition(mkVerticalStack(), 400, 100);
      expect(result.anchor?.id).toBe('B');
      expect(result.where).toBe(DropPositionEnum.BEFORE);
    });
  });

  describe('横向排列', () => {
    it('行内鼠标在元素水平中心左侧 → BEFORE', () => {
      const result = findDropPosition(mkHorizontalRow(), 20, 50);
      expect(result.anchor?.id).toBe('A');
      expect(result.where).toBe(DropPositionEnum.BEFORE);
    });

    it('行内鼠标在元素水平中心右侧 → AFTER', () => {
      const result = findDropPosition(mkHorizontalRow(), 80, 50);
      expect(result.anchor?.id).toBe('A');
      expect(result.where).toBe(DropPositionEnum.AFTER);
    });

    it('鼠标在行上方 → 仍按最近元素水平中心比较', () => {
      // x=280 在最近元素 C（x200-300）中心右侧 → AFTER
      const result = findDropPosition(mkHorizontalRow(), 280, -30);
      expect(result.anchor?.id).toBe('C');
      expect(result.where).toBe(DropPositionEnum.AFTER);
    });

    it('鼠标在行下方偏左 → BEFORE 最近元素（插入后元素占据鼠标下方位置）', () => {
      // x=20 在最近元素 A（x0-100）中心左侧 → BEFORE，新元素落到行首靠近鼠标 X
      const result = findDropPosition(mkHorizontalRow(), 20, 140);
      expect(result.anchor?.id).toBe('A');
      expect(result.where).toBe(DropPositionEnum.BEFORE);
    });

    it('鼠标在行下方最右侧 → AFTER 最后一个元素', () => {
      const result = findDropPosition(mkHorizontalRow(), 280, 140);
      expect(result.anchor?.id).toBe('C');
      expect(result.where).toBe(DropPositionEnum.AFTER);
    });
  });

  describe('混合布局（块级容器内嵌行级元素）', () => {
    // [block A (x0-800, y0-100)] [inline B (x0-200, y100-150)]，B 为末位子元素
    function mkMixed(): NodeInfo[] {
      return [
        mkInfo('A', 0, LayoutModeEnum.VERTICAL, 0, 0, 800, 100),
        mkInfo('B', 1, LayoutModeEnum.HORIZONTAL, 0, 100, 200, 50),
      ];
    }

    it('鼠标在末位行级元素下方、其水平中心左侧 → BEFORE（轴心比较不参与交叉轴）', () => {
      const result = findDropPosition(mkMixed(), 50, 160);
      expect(result.anchor?.id).toBe('B');
      expect(result.where).toBe(DropPositionEnum.BEFORE);
    });

    it('鼠标在行级元素纵向带内 → 按水平中心比较', () => {
      const result = findDropPosition(mkMixed(), 50, 125);
      expect(result.anchor?.id).toBe('B');
      expect(result.where).toBe(DropPositionEnum.BEFORE);
    });
  });

  describe('反向排列（row-reverse / float: right）', () => {
    // DOM 顺序 A B C，视觉顺序 C B A（row-reverse 从右往左排）
    function mkRowReverse(): NodeInfo[] {
      return [
        mkInfo('A', 0, LayoutModeEnum.HORIZONTAL, 200, 0, 100, 100, true),
        mkInfo('B', 1, LayoutModeEnum.HORIZONTAL, 100, 0, 100, 100, true),
        mkInfo('C', 2, LayoutModeEnum.HORIZONTAL, 0, 0, 100, 100, true),
      ];
    }

    it('鼠标在视觉最右元素（DOM 最后）中心右侧 → DOM 语义 BEFORE', () => {
      const result = findDropPosition(mkRowReverse(), 280, 50);
      expect(result.anchor?.id).toBe('A');
      expect(result.where).toBe(DropPositionEnum.BEFORE);
    });

    it('鼠标在视觉最左元素（DOM 最先）中心左侧 → DOM 语义 AFTER', () => {
      const result = findDropPosition(mkRowReverse(), 20, 50);
      expect(result.anchor?.id).toBe('C');
      expect(result.where).toBe(DropPositionEnum.AFTER);
    });
  });
});
