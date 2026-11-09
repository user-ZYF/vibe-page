import type { CollabMsgTypeEnum, CollabOpTypeEnum } from '@/constants/collab';
import type { CanvasStorageData, CanvasInnerElement, CanvasStyleRule } from '@/views/Canvas/types';
import type { StyleRuleTypeEnum } from '@/constants/style';

/** 新增元素操作（beforeId 为插入点后的兄弟元素 id，null 表示追加到末尾；parentId 为空串表示根级） */
export interface CollabAddOp {
  /** 操作类型 */
  type: CollabOpTypeEnum.ADD;
  /** 目标父元素 id（空串表示根级 children） */
  parentId: string;
  /** 插入到该元素之前（null 表示追加） */
  beforeId: string | null;
  /** 新增元素（含完整子树） */
  element: CanvasInnerElement;
}

/** 删除元素操作（含子树） */
export interface CollabRemoveOp {
  /** 操作类型 */
  type: CollabOpTypeEnum.REMOVE;
  /** 元素 id */
  id: string;
}

/** 移动元素操作 */
export interface CollabMoveOp {
  /** 操作类型 */
  type: CollabOpTypeEnum.MOVE;
  /** 元素 id */
  id: string;
  /** 目标父元素 id（空串表示根级） */
  parentId: string;
  /** 插入到该元素之前（null 表示追加） */
  beforeId: string | null;
}

/** 更新元素属性操作（浅合并；值为 null 表示删除该属性；id/type/children 不可更新） */
export interface CollabUpdateOp {
  /** 操作类型 */
  type: CollabOpTypeEnum.UPDATE;
  /** 元素 id */
  id: string;
  /** 属性补丁 */
  props: Record<string, unknown>;
}

/** 写入/覆盖样式规则（按 selector + type 定位） */
export interface CollabStyleSetOp {
  /** 操作类型 */
  type: CollabOpTypeEnum.STYLE_SET;
  /** 样式规则 */
  rule: CanvasStyleRule;
}

/** 删除样式规则 */
export interface CollabStyleRemoveOp {
  /** 操作类型 */
  type: CollabOpTypeEnum.STYLE_REMOVE;
  /** 选择器 */
  selector: string;
  /** 规则类型 */
  ruleType: StyleRuleTypeEnum;
  /** 完整 at-rule 文本 */
  atRuleCssText?: string;
}

/** 协作语义操作 */
export type CollabOp =
  | CollabAddOp
  | CollabRemoveOp
  | CollabMoveOp
  | CollabUpdateOp
  | CollabStyleSetOp
  | CollabStyleRemoveOp;

/** 房间成员信息 */
export interface CollabMember {
  /** 用户 ID */
  userId: number;
  /** 昵称 */
  nickname: string;
}

/** 远程选中标记信息 */
export interface CollabSelectionInfo {
  /** 元素 ID */
  elementId: string;
  /** 选中该元素的成员列表 */
  members: CollabMember[];
}

/** 客户端提交修改 */
export interface CollabOpMsg {
  /** 消息类型 */
  type: CollabMsgTypeEnum.OP;
  /** 应用 ops 前的画布数据 */
  baseData: CanvasStorageData;
  /** 应用 ops 后的画布数据 */
  canvasData: CanvasStorageData;
  /** 语义操作列表 */
  ops: CollabOp[];
}

/** 客户端上报/取消元素选中标记 */
export interface CollabSelectionMsg {
  /** 消息类型 */
  type: CollabMsgTypeEnum.SELECT | CollabMsgTypeEnum.DESELECT;
  /** 元素 ID */
  elementId: string;
  /** 客户端基准画布数据 */
  baseData: CanvasStorageData;
}

/** 客户端发往服务端的消息联合 */
export type CollabClientMsg = CollabOpMsg | CollabSelectionMsg;

/** 服务端下发初始数据 */
export interface CollabInitMsg {
  /** 消息类型 */
  type: CollabMsgTypeEnum.INIT;
  /** 页面标题 */
  title: string;
  /** 页面所有者用户 ID */
  userId: number;
  /** 服务端最新画布数据 */
  canvasData: CanvasStorageData;
  /** 当前在线成员列表 */
  members: CollabMember[];
  /** 当前远程选中标记表 */
  selections: CollabSelectionInfo[];
}

/** 服务端确认修改 */
export interface CollabAckMsg {
  /** 消息类型 */
  type: CollabMsgTypeEnum.ACK;
}

/** 服务端拒绝修改 */
export interface CollabRejectMsg {
  /** 消息类型 */
  type: CollabMsgTypeEnum.REJECT;
  /** 服务器当前画布数据 */
  canvasData: CanvasStorageData;
}

/** 服务端广播其他成员的修改 */
export interface CollabOpBcastMsg {
  /** 消息类型 */
  type: CollabMsgTypeEnum.OP_BCAST;
  /** 应用后的服务端画布数据 */
  canvasData: CanvasStorageData;
  /** 语义操作列表 */
  ops: CollabOp[];
  /** 修改来源用户 ID */
  userId: number;
}

/** 服务端广播远程选中标记变化 */
export interface CollabSelectionUpdateMsg {
  /** 消息类型 */
  type: CollabMsgTypeEnum.SELECTION_UPDATE;
  /** 元素 ID */
  elementId: string;
  /** 选中该元素的成员列表（空数组表示标记已移除） */
  members: CollabMember[];
}

/** 服务端广播成员列表 */
export interface CollabMembersMsg {
  /** 消息类型 */
  type: CollabMsgTypeEnum.MEMBERS;
  /** 在线成员列表 */
  members: CollabMember[];
}

/** 服务端发往客户端的消息联合 */
export type CollabServerMsg =
  | CollabInitMsg
  | CollabAckMsg
  | CollabRejectMsg
  | CollabOpBcastMsg
  | CollabSelectionUpdateMsg
  | CollabMembersMsg;
