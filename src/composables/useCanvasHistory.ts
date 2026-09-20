import { ref, shallowRef, computed, watch } from 'vue';
import { cloneDeep } from 'lodash';
import { useDebounceFn } from '@vueuse/core';
import { create, type Delta } from 'jsondiffpatch';

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
 *
 * 采用「增量 diff/patch」机制实现历史记录管理：
 * - 仅存储相邻状态之间的差异（patch），而非全量快照，大幅减少冗余数据
 * - 数组元素按 id 匹配（jsondiffpatch objectHash），元素移动/重排只产生极小 diff
 *
 * 优化：debouncedRecord 中判断 isUndoRedoing 状态，避免撤销重做引起的数据变化触发循环记录
 */
export function useCanvasHistory<T>(options: UseCanvasHistoryOptions<T>) {
  // jsondiffpatch 实例，按元素 id 匹配数组节点，开启移动检测
  const diffpatcher = create({
    objectHash: (obj) => (obj as { id?: string }).id,
    arrays: { detectMove: true, includeValueOnMove: false },
  });

  // patch 链：patches[i] 为状态 i -> 状态 i+1 的差异
  const patches = shallowRef<Delta[]>([]);
  // 当前状态索引（0 表示初始基线状态）
  const historyIndex = ref(0);
  // 当前状态快照（非响应式深拷贝，作为 patch 的基准）
  let currentSnapshot: T | null = null;
  // 是否正在执行撤销/重做（防止循环记录）
  const _isUndoRedoing = ref(false);
  // 是否有待记录的防抖快照
  const _isRecordPending = ref(false);

  // 是否可撤销
  const canUndo = computed(() => historyIndex.value > 0);
  // 是否可重做
  const canRedo = computed(() => historyIndex.value < patches.value.length);

  /** 记录当前状态到历史 */
  function recordHistory() {
    const newSnapshot = cloneDeep(options.snapshot());
    // 首次记录：以当前状态建立初始基线，不产生可撤销的变更
    if (currentSnapshot === null) {
      currentSnapshot = newSnapshot;
      patches.value = [];
      historyIndex.value = 0;
      return;
    }

    const delta = diffpatcher.diff(currentSnapshot, newSnapshot);
    // 无变化则跳过
    if (delta === undefined) return;

    // 截断未来历史（undo 后再次编辑，丢弃 redo 分支）
    patches.value = patches.value.slice(0, historyIndex.value);

    // 追加新 patch
    patches.value = [...patches.value, delta];
    historyIndex.value++;
    currentSnapshot = newSnapshot;

    // 限制最大历史长度
    while (patches.value.length > MAX_HISTORY_LENGTH) {
      // 先进先出，弹出最早记录的一次patch，使用slice保证响应式触发
      patches.value = patches.value.slice(1);
      historyIndex.value--;
    }
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
    if (!canUndo.value || currentSnapshot === null) return;
    _isUndoRedoing.value = true;
    historyIndex.value--;
    const delta = patches.value[historyIndex.value];
    currentSnapshot = diffpatcher.unpatch(currentSnapshot, delta) as T;
    options.restore(cloneDeep(currentSnapshot));
  }

  /** 重做 */
  function redo() {
    flushPendingRecord();
    if (!canRedo.value || currentSnapshot === null) return;
    _isUndoRedoing.value = true;
    const delta = patches.value[historyIndex.value];
    currentSnapshot = diffpatcher.patch(currentSnapshot, delta) as T;
    historyIndex.value++;
    options.restore(cloneDeep(currentSnapshot));
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
