import { cloneDeep, isEqual } from 'lodash'
import type { CanvasStorageData, CanvasElement, CanvasInnerElement, CanvasRootElement, CanvasStyleRule, ElementPosition, MergedStyleRule } from '@/views/Canvas/types'
import { isParentElement } from '@/views/Canvas/types'
import { findElementInList, findElementInTree, forEachElementInList } from '@/utils/tree-traversal'
import { StyleRuleTypeEnum } from '@/constants/style'
import type { CollabOp, FilterLocalOpsResult, RebaseLocalOpsResult } from '@/api/model/collab'
import { CollabOpTypeEnum as OpType } from '@/constants/collab'

/** 样式规则定位键（AT_RULE 无独立选择器，以规则文本区分） */
function styleRuleKey(type: StyleRuleTypeEnum, selector: string, atRuleCssText = ''): string {
  return type === StyleRuleTypeEnum.AT_RULE ? `${type}|${atRuleCssText}` : `${type}|${selector}`
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

/** 样式规则收集 */
function collectRules (rules: CanvasStyleRule[] = []) {
  const map = new Map<string, MergedStyleRule>()
  for (const rule of rules) {
    const key = styleRuleKey(rule.type, rule.selector, rule.atRuleCssText)
    const entry: MergedStyleRule = map.get(key) ?? {
      type: rule.type,
      selector: rule.selector,
      atRuleCssText: rule.atRuleCssText,
      merged: {}
    }
    Object.assign(entry.merged, rule.style)
    map.set(key, entry)
  }
  return map
}

/** 序列中某元素的前驱 id（无则为 null） */
function prevOf(seq: string[], id: string): string | null {
  const index = seq.indexOf(id)
  return index > 0 ? seq[index - 1] : null
}

/** 将元素插入到 targetId 之前（targetId 为空或不在列表中则追加） */
function insertBefore(
  list: CanvasInnerElement[],
  targetId: string | null,
  el: CanvasInnerElement
): void {
  const index = targetId ? list.findIndex((item) => item.id === targetId) : -1
  list.splice(index >= 0 ? index : list.length, 0, el)
}

/** 元素的结构字段 */
const STRUCT_KEYS = new Set(['id', 'type', 'children'])

/** 两个对象的属性浅 diff（被删除的属性以 null 表示） */
function diffProps<T extends object>(from: T, to: T, exclude?: Set<string>): Record<string, unknown> {
  const props: Record<string, unknown> = {}
  const keys = new Set([...Object.keys(from), ...Object.keys(to)])
  for (const key of keys) {
    if (exclude?.has(key)) continue
    const prop = key as keyof T
    const next = to[prop]
    const prev = from[prop]
    if (next === undefined && prev !== undefined) {
      // undefined 序列化时会丢失
      props[key] = null
    } else if (!isEqual(next, prev)) {
      props[key] = next
    }
  }
  return props
}

/** 取目标父级的 children 列表 */
function resolveChildren(data: CanvasStorageData, parentId: string): CanvasInnerElement[] | null {
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

/** 收集元素及其子孙的全部 id */
function collectSubtreeIds(el: CanvasElement, ids = new Set<string>()): Set<string> {
  ids.add(el.id)
  if (isParentElement(el)) forEachElementInList(el.children, (child) => ids.add(child.id))
  return ids
}

/**
 * 数据结构差异推导操作语义
 * @param from 基准画布数据
 * @param to 当前画布数据
 * @returns 操作列表
 */
export function deriveOps(from: CanvasStorageData, to: CanvasStorageData): CollabOp[] | null {
  const ops: CollabOp[] = []
  
  // 样式处理
  const fromRules = collectRules(from.styleRules)
  const toRules = collectRules(to.styleRules)
  for (const [key, { type, selector, atRuleCssText }] of fromRules) {
    // 删除整条旧规则
    if (!toRules.has(key)) {
      ops.push({
        type: OpType.STYLE_SET,
        selector,
        ruleType: type,
        atRuleCssText
      })
    }
  }
  for (const [key, { type, selector, atRuleCssText, merged }] of toRules) {
    const old = fromRules.get(key)
    if (!old) {
      // 新增规则
      ops.push({
        type: OpType.STYLE_SET,
        selector,
        ruleType: type,
        atRuleCssText,
        style: cloneDeep(merged)
      })
    } else if (!isEqual(old.merged, merged)) {
      // 规则有变化，只记录变化的部分
      ops.push({
        type: OpType.STYLE_SET,
        selector,
        ruleType: type,
        atRuleCssText,
        style: diffProps(old.merged, merged) as Record<string, string | null>
      })
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
      const old = oldMap.get(el.id)
      if (!old) {
        // 新增：整棵子树随 add 操作发出，不再递归
        ops.push({ type: OpType.ADD, parentId, beforeId, element: cloneDeep(el) })
        return
      }
      const moved = old.parentId !== parentId || prevOf(newSeq, el.id) !== prevOf(oldSeq, el.id)
      if (moved) {
        ops.push({ type: OpType.MOVE, id: el.id, parentId, beforeId })
      }
      const props = diffProps(old.el, el, STRUCT_KEYS)
      if (Object.keys(props).length) {
        ops.push({ type: OpType.UPDATE, id: old.el.id, props })
      }
      if (isParentElement(el)) walk(el.children, el.id)
    })
  }
  // 根元素 parentId 以空字符串标识
  walk([to.root], '')

  // 删除
  for (const [id, pos] of oldMap) {
    if (newMap.has(id)) {
      continue
    }
    // 只推最外层被删元素的 remove，子孙随祖先一并删除不重复发
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
        // parentId 为空表示替换根元素，id 相同则无需处理
        if (op.parentId === '') {
          if (data.root.id !== op.element.id) {
            data.root = cloneDeep(op.element) as CanvasRootElement
          }
          break
        }
        const list = resolveChildren(data, op.parentId)
        if (!list || findElementInTree(data.root, op.element.id)) break
        insertBefore(list, op.beforeId, cloneDeep(op.element) as CanvasInnerElement)
        break
      }
      case OpType.REMOVE: {
        detachElement(data, op.id)
        break
      }
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
          // 结构字段不可更新（id 变更按 删除+新增 语义处理）
          if (STRUCT_KEYS.has(key)) continue
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
        // 同名规则可能有多条（级联生效），补丁需作用于整条同名规则集
        const matches: CanvasStyleRule[] = data.styleRules.filter(
          (r) =>
            styleRuleKey(r.type, r.selector, r.atRuleCssText) ===
            styleRuleKey(op.ruleType, op.selector, op.atRuleCssText)
        )
        if (!op.style) {
          // 缺省 style 表示删除整条规则集
          data.styleRules = data.styleRules.filter((r) => !matches.includes(r))
          break
        }
        if (matches.length === 0) {
          // 基准画布中没有对应规则，则直接添加
          const style: Record<string, string> = {}
          for (const [k, v] of Object.entries(op.style)) {
            if (v !== null) style[k] = v
          }
          data.styleRules.push({ type: op.ruleType, selector: op.selector, atRuleCssText: op.atRuleCssText, style })
          break
        }
        // 按属性合并（null 表示从所有同名规则中删除该属性；新增/修改写入所有含该属性的规则，无则写入最后一条同名规则）
        const lastRule = matches[matches.length - 1]
        for (const [k, v] of Object.entries(op.style)) {
          if (v === null) {
            matches.forEach((r) => delete r.style[k])
            continue
          }
          const holders = matches.filter((r) => r.style[k] !== undefined)
          if (holders.length > 0) {
            holders.forEach((r) => { r.style[k] = v })
          } else {
            lastRule.style[k] = v
          }
        }
        break
      }
    }
  }
  return data
}

/**
 * 本地操作对远程操作做 transform
 * @param localOps 本地未确认操作
 * @param remoteOps 远程操作
 * @param baseData 本地基准数据（用于解析远程删除元素的子孙 id）
 * @param remoteBaseData 远程操作应用后的画布数据（用于校验本地 move/add 的目标父级位置）
 * @returns 裁剪后的本地操作与是否有操作被丢弃
 */
export function filterLocalOps(
  localOps: CollabOp[],
  remoteOps: CollabOp[],
  baseData: CanvasStorageData,
  remoteBaseData: CanvasStorageData
): FilterLocalOpsResult {
  const removedIds = new Set<string>()
  const remoteMoveIds = new Set<string>()
  const remoteUpdateKeys = new Map<string, Set<string>>()
  const remoteStyleSetKeys = new Map<string, Set<string>>()
  const remoteStyleRemoveKeys = new Set<string>()

  for (const op of remoteOps) {
    switch (op.type) {
      case OpType.REMOVE: {
        // 收集所有
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
        const key = styleRuleKey(op.ruleType, op.selector, op.atRuleCssText)
        if (op.style) {
          const keys = remoteStyleSetKeys.get(key) ?? new Set<string>()
          for (const k of Object.keys(op.style)) keys.add(k)
          remoteStyleSetKeys.set(key, keys)
        } else {
          remoteStyleRemoveKeys.add(key)
        }
        break
      }
      default:
        break
    }
  }

  /** 远程后画布全部元素 id */
  const remoteBaseIds = collectSubtreeIds(remoteBaseData.root)

  // 是否有本地操作被丢弃
  let dropped = false
  const ops = localOps
    .map((op): CollabOp | null => {
      switch (op.type) {
        case OpType.ADD: {
          // 目标父级已被远程删除：新增无处安放，丢弃
          if (removedIds.has(op.parentId)) {
            dropped = true
            return null
          }
          // 新增元素中不允许出现与画布重复id的元素（parentId 为空为整根替换，无需校验）
          if (op.parentId !== '') {
            const subTreeIds = collectSubtreeIds(op.element)
            let hasDuplicate = false
            for (const id of subTreeIds) {
              if (remoteBaseIds.has(id)) {
                hasDuplicate = true
                break
              }
            }
            if (hasDuplicate) {
              dropped = true
              return null
            }
          }
          // 插入锚点已被远程删除：锚点失效，退化为追加到末尾
          if (op.beforeId && removedIds.has(op.beforeId)) {
            return { ...op, beforeId: null }
          }
          return op
        }
        case OpType.REMOVE: {
          // 目标已被远程删除：重复删除无意义，丢弃
          if (removedIds.has(op.id)) {
            dropped = true
            return null
          }
          return op
        }
        case OpType.MOVE: {
          // 目标/目标父级已被远程删除，或同一元素都被移动：本地 move 丢弃
          if (removedIds.has(op.id) || removedIds.has(op.parentId) || remoteMoveIds.has(op.id)) {
            dropped = true
            return null
          }
          // 远程未移动该元素、但把目标父级挪进了它的子树（或父级即自身）：移动会形成循环嵌套，丢弃
          const movedEl = findElementInTree(remoteBaseData.root, op.id)
          if (op.parentId === op.id || (movedEl && isParentElement(movedEl) && findElementInList(movedEl.children, op.parentId))) {
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
          const props = { ...op.props }
          for (const key of conflicts) {
            // 同名字段被远程更新：本地剔除
            if (key in props) {
              delete props[key]
              dropped = true
            }
          }
          // 本地 update 中没有剩余字段，整个 update 丢弃
          return Object.keys(props).length ? { ...op, props } : null
        }
        case OpType.STYLE_SET: {
          const key = styleRuleKey(op.ruleType, op.selector, op.atRuleCssText)
          // 目标已被远程删除：整个 set 丢弃
          if (remoteStyleRemoveKeys.has(key)) {
            dropped = true
            return null
          }
          const conflicts = remoteStyleSetKeys.get(key)
          if (!conflicts) return op
          // 本地删除整条规则：远程已改写同一条规则则丢弃
          if (!op.style) {
            dropped = true
            return null
          }
          const style = { ...op.style }
          for (const k of conflicts) {
            // 同名样式被远程更新：本地剔除
            if (k in style) {
              delete style[k]
              dropped = true
            }
          }
          // 本地补丁无剩余属性，整个 set 丢弃
          return Object.keys(style).length ? { ...op, style } : null
        }
        default:
          return op
      }
    })
    .filter((op): op is CollabOp => op !== null)

  return { ops, dropped }
}

/**
 * 将本地画布相对旧基准的修改重放到新的远程基准上
 * @param localBaseData 本地断线前的服务端确认基准
 * @param localCanvasData 当前本地画布数据
 * @param remoteBaseData 重连后服务端下发的最新画布数据
 * @returns 合并后的画布、仍需提交的操作及是否有本地修改被裁剪
 */
export function rebaseLocalOps(
  localBaseData: CanvasStorageData,
  localCanvasData: CanvasStorageData,
  remoteBaseData: CanvasStorageData
): RebaseLocalOpsResult {
  const localOps = deriveOps(localBaseData, localCanvasData) ?? []
  const remoteOps = deriveOps(localBaseData, remoteBaseData) ?? []
  const { ops, dropped } = filterLocalOps(localOps, remoteOps, localBaseData, remoteBaseData)
  const canvasData = ops.length ? applyOps(remoteBaseData, ops) : cloneDeep(remoteBaseData)
  return { canvasData, ops: deriveOps(remoteBaseData, canvasData), dropped }
}
