import { ref, computed, watch, type Ref } from 'vue';
import { cloneDeep } from 'lodash';
import type { CanvasInnerElement, CanvasRootElement } from '@/views/Canvas/types';

/** 历史记录最大长度 */
const MAX_HISTORY_LENGTH = 50;

export const canvasHistoryApi = {
  undo: () => {},
  redo: () => {},
  canUndo: ref(false),
  canRedo: ref(false),
};

/**
 * 画布撤销/重做功能
 * 通过深克隆 elements 数组实现历史快照管理
 */
export function useCanvasHistory(root: Ref<CanvasRootElement>) {
  /** 历史记录快照列表 */
  const history = ref<CanvasRootElement[]>([]);
  /** 当前历史位置 */
  const historyIndex = ref(-1);
  /** 是否正在执行撤销/重做（防止循环记录） */
  const _isUndoRedoing = ref(false);

  /** 是否可撤销 */
  const canUndo = computed(() => historyIndex.value > 0);
  /** 是否可重做 */
  const canRedo = computed(() => historyIndex.value < history.value.length - 1);

  /** 记录当前画布状态到历史 */
  function recordHistory() {
    if (_isUndoRedoing.value) {
      _isUndoRedoing.value = false;
      return;
    }
    history.value = history.value.slice(0, historyIndex.value + 1);
    history.value.push(cloneDeep(root.value));
    if (history.value.length > MAX_HISTORY_LENGTH) {
      history.value.shift();
    } else {
      historyIndex.value = history.value.length - 1;
    }
  }

  /** 撤销 */
  function undo() {
    if (!canUndo.value) return;
    _isUndoRedoing.value = true;
    historyIndex.value--;
    root.value = cloneDeep(history.value[historyIndex.value]);
  }

  /** 重做 */
  function redo() {
    if (!canRedo.value) return;
    _isUndoRedoing.value = true;
    historyIndex.value++;
    root.value = cloneDeep(history.value[historyIndex.value]);
  }

  /** 同步到模块级 API，供其他组件调用 */
  canvasHistoryApi.undo = undo;
  canvasHistoryApi.redo = redo;
  watch(canUndo, (val) => { canvasHistoryApi.canUndo.value = val; }, { immediate: true });
  watch(canRedo, (val) => { canvasHistoryApi.canRedo.value = val; }, { immediate: true });

  return {
    canUndo,
    canRedo,
    recordHistory,
    undo,
    redo,
  };
}
