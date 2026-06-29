import { ref, shallowRef, computed, watch } from 'vue';
import { cloneDeep } from 'lodash';
import { useDebounceFn } from '@vueuse/core';

/** 历史记录最大长度 */
const MAX_HISTORY_LENGTH = 50;

/** 撤销/重做配置选项 */
export interface UseCanvasHistoryOptions<T> {
  /** 获取当前状态快照 */
  snapshot: () => T;
  /** 从快照恢复状态 */
  restore: (state: T) => void;
  /** 防抖记录时间（ms），默认 300 */
  debounceMs?: number;
}

export const canvasHistoryApi = {
  undo: () => {},
  redo: () => {},
  canUndo: ref(false),
  canRedo: ref(false),
};

/**
 * 画布撤销/重做功能
 * 通过快照机制实现历史记录管理，支持对任意数据进行监控
 * 优化：recordHistory中也需要判断isUndoRedoing状态，避免在使用watch+recordHistory时因撤销重做导致数据变化引起的状态记录
 */
export function useCanvasHistory<T>(options: UseCanvasHistoryOptions<T>) {
  /** 历史记录快照列表 */
  const history = shallowRef<T[]>([]);
  /** 当前历史位置 */
  const historyIndex = ref(-1);
  /** 是否正在执行撤销/重做（防止循环记录） */
  const _isUndoRedoing = ref(false);
  /** 是否有待记录的防抖快照 */
  const _isRecordPending = ref(false);

  /** 是否可撤销 */
  const canUndo = computed(() => historyIndex.value > 0);
  /** 是否可重做 */
  const canRedo = computed(() => historyIndex.value < history.value.length - 1);

  /** 记录当前状态到历史 */
  function recordHistory() {
    const newHistory = history.value.slice(0, historyIndex.value + 1);
    newHistory.push(cloneDeep(options.snapshot()));
    if (newHistory.length > MAX_HISTORY_LENGTH) {
      newHistory.shift();
    } else {
      historyIndex.value = newHistory.length - 1;
    }
    history.value = newHistory;
  }

  /** 刷新待记录的防抖快照，确保最新状态已入历史 */
  function flushPendingRecord() {
    if (_isRecordPending.value) {
      _isRecordPending.value = false;
      recordHistory();
    }
  }

  /** 防抖记录历史，避免频繁操作（如拖拽滑块、输入文本）产生过多快照 */
  const _debouncedFn = useDebounceFn(() => {
    if (!_isRecordPending.value) return;
    _isRecordPending.value = false;
    recordHistory();
  }, options.debounceMs ?? 300);

  function debouncedRecord() {
    if (_isUndoRedoing.value) {
      _isUndoRedoing.value = false;
      return;
    }
    _isRecordPending.value = true;
    _debouncedFn();
  }

  /** 撤销 */
  function undo() {
    flushPendingRecord();
    if (!canUndo.value) return;
    _isUndoRedoing.value = true;
    historyIndex.value--;
    options.restore(cloneDeep(history.value[historyIndex.value]));
  }

  /** 重做 */
  function redo() {
    flushPendingRecord();
    if (!canRedo.value) return;
    _isUndoRedoing.value = true;
    historyIndex.value++;
    options.restore(cloneDeep(history.value[historyIndex.value]));
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
    debouncedRecord,
    undo,
    redo,
  };
}
