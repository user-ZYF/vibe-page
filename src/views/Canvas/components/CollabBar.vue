<!-- ? 协作状态栏 -->
<template>
  <div class="collab-bar">
    <!-- 连接状态指示 -->
    <me-tooltip :content="statusText" effect="light">
      <span class="collab-bar-dot" :class="statusClass"></span>
    </me-tooltip>
    <!-- 在线成员头像 -->
    <a-avatar-group :max-count="5" size="small">
      <me-tooltip
        v-for="member in members"
        :key="member.userId"
        :content="member.nickname"
        effect="light"
      >
        <a-avatar
          :style="{ backgroundColor: memberColor(member.userId) }"
          size="small"
        >
          {{ avatarText(member.nickname) }}
        </a-avatar>
      </me-tooltip>
    </a-avatar-group>
    <!-- 分享按钮（仅画布所有者） -->
    <me-tooltip v-if="isMine" content="协作分享" effect="light">
      <me-button @click="emit('share')">
        <ShareAltOutlined />
      </me-button>
    </me-tooltip>
  </div>
</template>

<script lang="ts" setup>
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { ShareAltOutlined } from '@ant-design/icons-vue';
import { MeButton, MeTooltip } from '@zyf_dsb/me-ui';
import { useCollabStore } from '@/store/collab';
import { CollabStatusEnum } from '@/constants/collab';
import { memberColor } from '@/utils/member-color';

defineOptions({
  name: 'CollabBar',
});

defineProps({
  /** 画布是否属于自己（决定是否展示分享入口） */
  isMine: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits<{
  /** 打开分享弹窗 */
  (e: 'share'): void;
}>();

const collabStore = useCollabStore();
const { members, status } = storeToRefs(collabStore);

/** 连接状态文案 */
const statusText = computed(() => {
  switch (status.value) {
    case CollabStatusEnum.CONNECTED:
      return '协作已连接';
    case CollabStatusEnum.CONNECTING:
      return '协作连接中';
    case CollabStatusEnum.DENIED:
      return '无法加入协作';
    default:
      return '协作未连接';
  }
});

/** 连接状态点样式类 */
const statusClass = computed(() => {
  switch (status.value) {
    case CollabStatusEnum.CONNECTED:
      return 'is-online';
    case CollabStatusEnum.DENIED:
      return 'is-denied';
    default:
      return 'is-connecting';
  }
});

/** 头像兜底文本（昵称首字符） */
function avatarText(nickname: string): string {
  return nickname?.slice(0, 1) ?? '?';
}
</script>

<style scoped lang="less">
.collab-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 4px;

  &-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;

    &.is-online {
      background: #52c41a;
    }

    &.is-connecting {
      background: #faad14;
    }

    &.is-denied {
      background: #f5222d;
    }
  }
}
</style>
