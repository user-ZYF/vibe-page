import { cloneDeep, isEqual } from 'lodash'
import type { CanvasStorageData, CanvasElement, CanvasInnerElement, CanvasStyleRule } from '@/views/Canvas/types'
import { isParentElement } from '@/views/Canvas/types'
import { findElementInList, findElementInTree, forEachElementInList } from '@/utils/tree-traversal'
import { StyleRuleTypeEnum } from '@/constants/style'
import type { CollabOp, CollabStyleRemoveOp } from '@/api/model/collab'
import { CollabOpTypeEnum as OpType } from '@/constants/collab'

/** 样式规则定位键（AT_RULE 无独立选择器，以规则文本区分） */
function styleRuleKey(rule: CanvasStyleRule): string {
  return rule.type === StyleRuleTypeEnum.AT_RULE
    ? `${rule.type}|${rule.atRuleCssText ?? ''}`
    : `${rule.type}|${rule.selector}`
}

/** STYLE_REMOVE 操作的定位键（与 styleRuleKey 同规则） */
function styleRemoveKey(op: CollabStyleRemoveOp): string {
  return op.ruleType === StyleRuleTypeEnum.AT_RULE
    ? `${op.ruleType}|${op.atRuleCssText ?? ''}`
    : `${op.ruleType}|${op.selector}`
}

/** 元素在树中的位置信息 */
interface ElementPosition {
  /** 元素本体 */
  el: CanvasElement
  /** 父元素 id（根元素为 ''） */
  parentId: string
}

/** 收集元素树（含根元素）中所有元素的位置映射，根元素的 parentId 为 '' */
function collectPositions(
  el: CanvasElement,
  parentId = '',
  map = new Map<string, ElementPosition>()
) {
  map.set(el.id, { el, parentId })
  if (isParentElement(el)) {
    for (const child of el.children) collectPositions(child, el.id, map)
  }
  return map
}

/** 序列中某元素的前驱 id（无则为 null） */
function prevOf(seq: string[], id: string): string | null {
  const index = seq.indexOf(id)
  return index > 0 ? seq[index - 1] : null
}

/** 元素的结构字段 */
const STRUCT_KEYS = new Set(['id', 'type', 'children'])

/** 两个元素对象的属性浅 diff（被删除的属性以 null 表示） */
function diffProps<T extends object>(from: T, to: T, exclude: Set<string>): Record<string, unknown> {
  const props: Record<string, unknown> = {}
  const keys = new Set([...Object.keys(from), ...Object.keys(to)])
  for (const key of keys) {
    if (exclude.has(key)) continue
    const prop = key as keyof T
    const next = to[prop]
    const prev = from[prop]
    if (next === undefined && prev !== undefined) {
      // undefined序列化时会丢失
      props[key] = null
    } else if (!isEqual(next, prev)) {
      props[key] = next
    }
  }
  return props
}

/**
 * 数据结构差异推导操作语义
 * @param from 基准画布数据
 * @param to 当前画布数据
 * @returns 操作列表
 */
export function deriveOps(from: CanvasStorageData, to: CanvasStorageData): CollabOp[] | null {
  const ops: CollabOp[] = []

  // 样式规则
  const fromRules = new Map((from.styleRules ?? []).map((r) => [styleRuleKey(r), r]))
  const toRules = new Map((to.styleRules ?? []).map((r) => [styleRuleKey(r), r]))
  for (const [key, rule] of fromRules) {
    if (!toRules.has(key)) {
      ops.push({
        type: OpType.STYLE_REMOVE,
        selector: rule.selector,
        ruleType: rule.type,
        atRuleCssText: rule.atRuleCssText
      })
    }
  }
  for (const [key, rule] of toRules) {
    const old = fromRules.get(key)
    if (!old || !isEqual(old.style, rule.style)) {
      ops.push({ type: OpType.STYLE_SET, rule: cloneDeep(rule) })
    }
  }

  // 移动&修改
  const oldMap = collectPositions(from.root)
  const newMap = collectPositions(to.root)

  const walk = (list: CanvasElement[], parentId: string) => {
    const oldParentEl = oldMap.get(parentId)?.el
    const oldSiblings: CanvasInnerElement[] =
      oldParentEl && isParentElement(oldParentEl) ? oldParentEl.children : []
    // 新列表中与旧列表同父元素的childId序列
    const newSeq = list.filter((el) => oldMap.get(el.id)?.parentId === parentId).map((el) => el.id)
    // 旧列表中与新列表同父元素的childId序列
    const oldSeq = oldSiblings
      .filter((el) => newMap.get(el.id)?.parentId === parentId)
      .map((el) => el.id)

    list.forEach((el, i) => {
      const beforeId = list[i + 1]?.id ?? null
      // 顶层元素（根元素）按位置匹配（parentId 为 '' 的项即旧根），其余按 id 匹配
      const old = parentId === '' ? oldMap.get(from.root.id) : oldMap.get(el.id)
      if (!old) {
        // 新增：整棵子树随 add 操作发出，不再递归
        ops.push({ type: OpType.ADD, parentId, beforeId, element: cloneDeep(el) as CanvasInnerElement })
        return
      }
      const moved = old.parentId !== parentId || prevOf(newSeq, el.id) !== prevOf(oldSeq, el.id)
      if (moved) {
        ops.push({ type: OpType.MOVE, id: el.id, parentId, beforeId })
      }
      const props = diffProps(old.el, el, STRUCT_KEYS)
      // 按位置匹配的元素允许身份变更（仅根元素可命中），id 随 props 一并下发
      if (old.el.id !== el.id) {
        props.id = el.id
      }
      if (Object.keys(props).length) {
        ops.push({ type: OpType.UPDATE, id: old.el.id, props })
      }
      if (isParentElement(el)) walk(el.children, el.id)
    })
  }
  walk([to.root], '')

  // 删除（只推最外层被删元素的 remove，子孙随祖先一并删除不重复发；）
  for (const [id, pos] of oldMap) {
    if (pos.parentId === '' || newMap.has(id)) {
      continue
    }
    let ancestorRemoved = false
    let pid = pos.parentId
    while (pid) {
      if (!newMap.has(pid)) {
        ancestorRemoved = true
        break
      }
      pid = oldMap.get(pid)?.parentId ?? ''
    }
    if (!ancestorRemoved) {
      ops.push({ type: OpType.REMOVE, id })
    }
  }

  return ops.length ? ops : null
}

/** 取目标父级的 children 列表（parentId 为空串时取根级，兼容旧协议） */
function resolveChildren(data: CanvasStorageData, parentId: string): CanvasInnerElement[] | null {
  if (parentId === '') return data.root.children
  const parent = findElementInTree(data.root, parentId)
  return parent && isParentElement(parent) ? parent.children : null
}

/** 从父级列表中摘除元素（返回被摘元素；根元素不可摘除） */
function detachElement(data: CanvasStorageData, id: string): CanvasInnerElement | null {
  if (id === data.root.id) return null
  const walk = (list: CanvasInnerElement[]): CanvasInnerElement | null => {
    const index = list.findIndex((el) => el.id === id)
    if (index >= 0) return list.splice(index, 1)[0]
    for (const el of list) {
      if (isParentElement(el)) {
        const found = walk(el.children)
        if (found) return found
      }
    }
    return null
  }
  return walk(data.root.children)
}

/** 将元素插入到 beforeId 之前（beforeId 为空或不在列表中则追加） */
function insertBefore(
  list: CanvasInnerElement[],
  beforeId: string | null,
  el: CanvasInnerElement
): void {
  const index = beforeId ? list.findIndex((item) => item.id === beforeId) : -1
  list.splice(index >= 0 ? index : list.length, 0, el)
}

/**
 * 应用操作列表
 */
export function applyOps(canvasData: CanvasStorageData, ops: CollabOp[]): CanvasStorageData {
  const data = cloneDeep(canvasData)
  data.root.children ??= []
  data.styleRules ??= []
  for (const op of ops) {
    switch (op.type) {
      case OpType.ADD: {
        const list = resolveChildren(data, op.parentId)
        if (!list || findElementInTree(data.root, op.element.id)) break
        insertBefore(list, op.beforeId, cloneDeep(op.element))
        break
      }
      case OpType.REMOVE:
        detachElement(data, op.id)
        break
      case OpType.MOVE: {
        // 先解析目标父级：不存在则整个操作失效，不摘除元素
        const list = resolveChildren(data, op.parentId)
        if (!list) break
        const el = detachElement(data, op.id)
        if (!el) break
        insertBefore(list, op.beforeId, el)
        break
      }
      case OpType.UPDATE: {
        const el = findElementInTree(data.root, op.id)
        if (!el) break
        for (const [key, value] of Object.entries(op.props)) {
          // 结构字段不可更新；仅根元素允许改 id（按位置定位，不受身份变更影响）
          if (STRUCT_KEYS.has(key) && !(key === 'id' && el === data.root)) continue
          const prop = key as keyof CanvasInnerElement
          if (value === null) {
            delete el[prop]
          } else {
            el[prop] = value as never
          }
        }
        break
      }
      case OpType.STYLE_SET: {
        const index = data.styleRules.findIndex((r) => styleRuleKey(r) === styleRuleKey(op.rule))
        if (index >= 0) {
          data.styleRules[index] = cloneDeep(op.rule)
        } else {
          data.styleRules.push(cloneDeep(op.rule))
        }
        break
      }
      case OpType.STYLE_REMOVE:
        data.styleRules = data.styleRules.filter((r) => styleRuleKey(r) !== styleRemoveKey(op))
        break
    }
  }
  return data
}

/** 收集元素及其子孙的全部 id */
function collectSubtreeIds(el: CanvasInnerElement, ids = new Set<string>()): Set<string> {
  ids.add(el.id)
  if (isParentElement(el)) forEachElementInList(el.children, (child) => ids.add(child.id))
  return ids
}

/** 本地操作冲突裁剪结果 */
export interface FilterLocalOpsResult {
  /** 裁剪后仍可应用的本地操作 */
  ops: CollabOp[]
  /** 是否有本地操作（或其中部分字段）因冲突被丢弃 */
  dropped: boolean
}

/**
 * 本地待发操作对远程操作做 transform
 * @param localOps 本地未确认操作
 * @param remoteOps 远程操作
 * @param baseData 本地基准数据（用于解析远程删除元素的子孙 id）
 * @returns 裁剪后的本地操作与是否有操作被丢弃
 */
export function filterLocalOps(
  localOps: CollabOp[],
  remoteOps: CollabOp[],
  baseData: CanvasStorageData
): FilterLocalOpsResult {
  const removedIds = new Set<string>()
  const remoteMoveIds = new Set<string>()
  const remoteUpdateKeys = new Map<string, Set<string>>()
  const remoteStyleKeys = new Set<string>()

  for (const op of remoteOps) {
    switch (op.type) {
      case OpType.REMOVE: {
        const el = findElementInList(baseData.root.children, op.id)
        if (el) collectSubtreeIds(el, removedIds)
        removedIds.add(op.id)
        break
      }
      case OpType.MOVE: {
        remoteMoveIds.add(op.id)
        break
      }
      case OpType.UPDATE: {
        const keys = remoteUpdateKeys.get(op.id) ?? new Set<string>()
        Object.keys(op.props).forEach((k) => keys.add(k))
        remoteUpdateKeys.set(op.id, keys)
        break
      }
      case OpType.STYLE_SET: {
        remoteStyleKeys.add(styleRuleKey(op.rule))
        break
      }
      case OpType.STYLE_REMOVE: {
        remoteStyleKeys.add(styleRemoveKey(op))
        break
      }
      default:
        break
    }
  }

  let dropped = false
  const ops = localOps
    .map((op): CollabOp | null => {
      switch (op.type) {
        // 目标父级已被远程删除：新增无处安放，丢弃
        case OpType.ADD: {
          if (removedIds.has(op.parentId)) {
            dropped = true
            return null
          }
          // 插入锚点已被远程删除：锚点失效，退化为追加到末尾
          if (op.beforeId && removedIds.has(op.beforeId)) {
            return { ...op, beforeId: null }
          }
          return op
        }
        // 目标已被远程删除：重复删除无意义，丢弃
        case OpType.REMOVE: {
          if (removedIds.has(op.id)) {
            dropped = true
            return null
          }
          return op
        }
        // 目标/目标父级已被远程删除，或同一元素都被移动：本地 move 丢弃
        case OpType.MOVE: {
          if (removedIds.has(op.id) || removedIds.has(op.parentId) || remoteMoveIds.has(op.id)) {
            dropped = true
            return null
          }
          // 插入锚点已被远程删除：锚点失效，退化为追加到末尾
          if (op.beforeId && removedIds.has(op.beforeId)) {
            return { ...op, beforeId: null }
          }
          return op
        }
        case OpType.UPDATE: {
          // 目标已被远程删除：整个 update 丢弃
          if (removedIds.has(op.id)) {
            dropped = true
            return null
          }
          const conflicts = remoteUpdateKeys.get(op.id)
          if (!conflicts) return op
          // 同名字段都被远程更新：本地 update 中的同名字段剔除
          const props = Object.fromEntries(
            Object.entries(op.props).filter(([key]) => {
              if (conflicts.has(key)) {
                dropped = true
                return false
              }
              return true
            })
          )
          return Object.keys(props).length ? { ...op, props } : null
        }
        // 同一条样式规则都被改写：本地 style 操作丢弃
        case OpType.STYLE_SET: {
          if (remoteStyleKeys.has(styleRuleKey(op.rule))) {
            dropped = true
            return null
          }
          return op
        }
        case OpType.STYLE_REMOVE: {
          if (remoteStyleKeys.has(styleRemoveKey(op))) {
            dropped = true
            return null
          }
          return op
        }
        default:
          return op
      }
    })
    .filter((op): op is CollabOp => op !== null)

  return { ops, dropped }
}
