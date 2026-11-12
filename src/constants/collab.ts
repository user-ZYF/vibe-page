/**
 * 协作消息类型
 */
export enum CollabMsgTypeEnum {
  /** 未定义 */
  UNDEFINED = 0,
  /** 客户端提交画布修改 */
  OP = 1,
  /** 客户端上报选中元素 */
  SELECT = 2,
  /** 客户端取消选中元素 */
  DESELECT = 3,
  /** 服务端下发初始数据 */
  INIT = 10,
  /** 服务端确认修改已被接受 */
  ACK = 11,
  /** 服务端拒绝修改（版本号不对） */
  REJECT = 12,
  /** 服务端广播协作者的修改 */
  OP_BCAST = 13,
  /** 服务端广播远程选中标记变化 */
  SELECTION_UPDATE = 15,
  /** 服务端广播在线成员列表 */
  MEMBERS = 16,
}

/** 协作语义操作类型 */
export enum CollabOpTypeEnum {
  /** 未定义 */
  UNDEFINED = 0,
  /** 新增元素（含子树） */
  ADD = 1,
  /** 删除元素（含子树） */
  REMOVE = 2,
  /** 移动元素 */
  MOVE = 3,
  /** 更新元素属性 */
  UPDATE = 4,
  /** 样式规则设置 */
  STYLE_SET = 5,
}

/** 协作 WebSocket 关闭码（自定义 4000+，与服务端约定） */
export enum CollabCloseCodeEnum {
  /** 未定义 */
  UNDEFINED = 0,
  /** 房间已满 */
  ROOM_FULL = 4001,
  /** 同账号已加入 */
  DUPLICATE_USER = 4002,
  /** 会话失效（账号在其他设备登录或已登出） */
  FORCE_OFFLINE = 4003,
}

/** 协作连接状态 */
export enum CollabStatusEnum {
  /** 未定义 */
  UNDEFINED = 0,
  /** 连接中 */
  CONNECTING = 1,
  /** 已连接 */
  CONNECTED = 2,
  /** 被服务端拒绝加入（如房间已满） */
  DENIED = 3,
}
