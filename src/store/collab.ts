import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { cloneDeep } from 'lodash';
import { useWebSocket } from '@vueuse/core';
import { message } from 'ant-design-vue';
import router from '@/router';
import { useCanvasStore } from '@/store/canvas';
import { useAuthStore } from '@/store/auth';
import { CollabCloseCodeEnum, CollabMsgTypeEnum, CollabStatusEnum } from '@/constants/collab';
import type { CanvasStorageData } from '@/views/Canvas/types';
import { deriveOps, applyOps, filterLocalOps } from '@/utils/collab-ops';
import { findElementInTree } from '@/utils/tree-traversal';
import type {
  CollabInitMsg,
  CollabOpBcastMsg,
  CollabServerMsg,
  CollabClientMsg,
  CollabMember,
  CollabOp,
} from '@/api/model/collab';

/** 协作状态 store：连接状态、在线成员、远程选中标记表、协作会话管理 */
export const useCollabStore = defineStore('collab', () => {
  /** 连接状态 */
  const status = ref(CollabStatusEnum.UNDEFINED);
  /** 在线成员列表 */
  const members = ref<CollabMember[]>([]);
  /** 远程选中标记表：elementId -> 选中该元素的成员列表（仅展示用） */
  const selections = ref(new Map<string, CollabMember[]>());
  /** 自己的用户 ID */
  const selfUserId = ref<number | null>(null);
  /** 页面标题（init 消息下发） */
  const pageTitle = ref('');
  /** 页面所有者用户 ID（init 消息下发） */
  const pageUserId = ref<number | null>(null);
  /** 是否已收到 init */
  const isReady = ref(false);

  /** 服务器确认过的画布数据（同步基准：画布 = baseData + allLocalOps） */
  let baseData: CanvasStorageData | null = null;
  /** 所有的本地修改 */
  let allLocalOps: CollabOp[] | null = null;
  /** 已发送但未确认的本地修改 */
  let pendingLocalOps: CollabOp[] | null = null;
  /** WebSocket 实例 */
  let socket: ReturnType<typeof useWebSocket> | null = null;

  /** 是否已加入协作房间 */
  const isConnected = computed(() => status.value === CollabStatusEnum.CONNECTED);
  /** 除自己外的在线成员 */
  const otherMembers = computed(() => members.value.filter((m) => m.userId !== selfUserId.value));
  /** 是否有其他协作者在线 */
  const hasOthers = computed(() => otherMembers.value.length > 0);

  /** 提交消息 */
  function commit(payload: CollabClientMsg): void {
    // ws只允许传输字符串或二进制数据
    socket?.send(JSON.stringify(payload));
  }

  /** 发送本地操作 */
  function sendLocalOps(): void {
    if (!baseData || !allLocalOps || pendingLocalOps || !isConnected.value) return;
    pendingLocalOps = allLocalOps;
    commit({ type: CollabMsgTypeEnum.OP, baseData, canvasData: localCanvasData(), ops: allLocalOps });
  }

  /** 本地画布快照 */
  function localCanvasData(): CanvasStorageData {
    return useCanvasStore().getCanvasData();
  }

  /** 远程同步触发的画布加载 */
  function remoteLoad(canvasData: CanvasStorageData, base: CanvasStorageData): void {
    baseData = cloneDeep(base);
    useCanvasStore().loadCanvasData(canvasData);
  }

  /** 重发本地修改请求 */
  function resend(): void {
    pendingLocalOps = null;
    allLocalOps = baseData ? deriveOps(baseData, localCanvasData()) : null;
    sendLocalOps();
  }

  /** 处理服务端 init：全量重置同步状态并渲染服务端最新画布数据 */
  function handleInit(msg: CollabInitMsg): void {
    baseData = cloneDeep(msg.canvasData);
    allLocalOps = null;
    pendingLocalOps = null;
    selfUserId.value = useAuthStore().userInfo?.id ?? null;
    pageTitle.value = msg.title;
    pageUserId.value = msg.userId;
    members.value = msg.members;
    selections.value = new Map(msg.selections.map((s) => [s.elementId, s.members]));
    remoteLoad(cloneDeep(msg.canvasData), msg.canvasData);
    status.value = CollabStatusEnum.CONNECTED;
    isReady.value = true;
  }

  /** 处理协作者操作 */
  function handleRemoteOp(msg: CollabOpBcastMsg): void {
    if (!baseData) return;
    const localOps = deriveOps(baseData, localCanvasData()) ?? [];

    // 本地未确认操作对远程 op 做 transform：冲突部分被裁剪（远程后到者优先）
    const { ops: survivingOps, dropped } = filterLocalOps(localOps, msg.ops, baseData);
    if (dropped) {
      message.warning('你的部分修改与协作者冲突，已同步为最新版本');
    }

    const newBase = msg.canvasData;
    const newLocal = survivingOps.length ? applyOps(newBase, survivingOps) : newBase;

    allLocalOps = survivingOps.length ? survivingOps : null;

    // 恢复选中：loadCanvasData 会清空选中，元素还在则重新选中（选中标记会随监听重发）
    const canvasStore = useCanvasStore();
    const selected = canvasStore.selectedElementId;
    remoteLoad(cloneDeep(newLocal), newBase);
    if (selected && findElementInTree(canvasStore.root, selected)) {
      canvasStore.selectElement(selected);
    }
    // 在飞的包必然被服务端拒收，等 reject 到达后统一重发；未在飞的 allLocalOps 立即重发
    sendLocalOps();
  }

  /** 消息分发 */
  function onMessage(raw: string): void {
    let msg: CollabServerMsg;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }
    switch (msg.type) {
      case CollabMsgTypeEnum.INIT:
        handleInit(msg);
        return;
      case CollabMsgTypeEnum.ACK:
        // 已确认的操作并入服务端确认版：画布内容 = 确认版 + 其后的本地修改
        if (pendingLocalOps && baseData) {
          baseData = applyOps(baseData, pendingLocalOps);
        }
        resend();
        return;
      case CollabMsgTypeEnum.REJECT:
        // 基准不一致：对齐最新服务端数据后重发
        baseData = cloneDeep(msg.canvasData);
        resend();
        return;
      case CollabMsgTypeEnum.OP_BCAST:
        handleRemoteOp(msg);
        return;
      case CollabMsgTypeEnum.SELECTION_UPDATE:
        // 服务端下发该元素当前的完整标记状态，空成员列表即清除
        if (msg.members.length) {
          selections.value.set(msg.elementId, msg.members);
        } else {
          selections.value.delete(msg.elementId);
        }
        return;
      case CollabMsgTypeEnum.MEMBERS:
        members.value = msg.members;
        return;
      default:
        return;
    }
  }

  /**
   * 加入协作房间
   * @param pageId 页面 ID
   * @param shareToken 分享令牌（通过协作链接进入时携带）
   */
  function join(pageId: number, shareToken = ''): void {
    const authStore = useAuthStore();

    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const wsBase = import.meta.env.VITE_WS_BASE_URL || `${proto}://${location.host}`;
    const url =
      `${wsBase}/ws?pageId=${pageId}` +
      `&token=${encodeURIComponent(authStore.accessToken)}` +
      `&share=${encodeURIComponent(shareToken)}`;

    status.value = CollabStatusEnum.CONNECTING;
    socket = useWebSocket(url, {
      // 仅成功入会（收到 INIT）后的断线才自动重连；初始连接失败不重试
      autoReconnect: { retries: () => status.value !== CollabStatusEnum.DENIED && isReady.value, delay: 2000 },
      // 消息接收
      onMessage: (_ws, event) => {
        onMessage(event.data);
      },
      // 连接失败&断开
      onDisconnected: (_ws, event) => {
        // 主动断开
        if (status.value === CollabStatusEnum.UNDEFINED) return;
        // 房间已满
        if (event.code === CollabCloseCodeEnum.ROOM_FULL) {
          status.value = CollabStatusEnum.DENIED;
          message.warning('协作人数已满，暂时无法加入');
          router.push('/');
          return;
        }
        // 同账号已加入
        if (event.code === CollabCloseCodeEnum.DUPLICATE_USER) {
          status.value = CollabStatusEnum.DENIED;
          message.warning('该画布已在其他窗口打开');
          router.push('/');
          return;
        }
        // 会话失效（被其他设备顶替或已登出）：清理登录态并跳登录页
        if (event.code === CollabCloseCodeEnum.FORCE_OFFLINE) {
          status.value = CollabStatusEnum.DENIED;
          message.error('账号已在其他设备登录，请重新登录');
          useAuthStore().clearAuth();
          router.push('/login');
          return;
        }
        // 初始连接失败（鉴权被拒或网络异常）：不重试，退回列表页
        if (!isReady.value) {
          status.value = CollabStatusEnum.DENIED;
          message.warning('无访问权限或网络异常');
          router.push('/');
          return;
        }
        // 断线重连
        status.value = CollabStatusEnum.CONNECTING;
      },
    });
  }

  /** 画布变化 -> 重算未确认操作并发送 */
  function syncLocalOps(): void {
    if (!baseData) return;
    allLocalOps = deriveOps(baseData, localCanvasData());
    sendLocalOps();
  }

  /** 选中变化即广播选中标记，供其他端展示彩色方框 */
  function syncSelection(id: string | null, prev: string | null): void {
    if (prev) {
      commit({ type: CollabMsgTypeEnum.DESELECT, elementId: prev });
    }
    if (id) {
      commit({ type: CollabMsgTypeEnum.SELECT, elementId: id });
    }
  }

  /** 离开协作房间：断开连接、重置状态 */
  function leave(): void {
    socket?.close();
    socket = null;
    baseData = null;
    allLocalOps = null;
    pendingLocalOps = null;
    reset();
  }

  /** 重置协作状态（离开画布/重连时调用） */
  function reset() {
    status.value = CollabStatusEnum.UNDEFINED;
    members.value = [];
    selections.value = new Map();
    selfUserId.value = null;
    pageTitle.value = '';
    pageUserId.value = null;
    isReady.value = false;
  }

  return {
    status,
    members,
    selections,
    selfUserId,
    pageTitle,
    pageUserId,
    isReady,
    isConnected,
    otherMembers,
    hasOthers,
    join,
    leave,
    reset,
    syncLocalOps,
    syncSelection,
  };
});
