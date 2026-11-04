<!-- ? 协作分享弹窗 -->
<template>
  <me-modal
    v-model:open="open"
    title="协作分享"
    :footer="null"
    width="420px"
  >
    <div class="share-modal">
      <div class="share-modal-row">
        <span class="share-modal-label">开启协作分享</span>
        <a-switch :checked="shared" :loading="loading" @change="handleToggle" />
      </div>
      <p class="share-modal-tip">开启后，获得链接的登录用户可以实时协作编辑此画布</p>
      <div v-if="shared && shareUrl" class="share-modal-link">
        <span class="share-modal-url">{{ shareUrl }}</span>
        <me-button @click="handleCopy">
          <CopyOutlined />
        </me-button>
      </div>
    </div>
  </me-modal>
</template>

<script lang="ts" setup>
import { ref, computed, watch } from 'vue';
import { message } from 'ant-design-vue';
import { CopyOutlined } from '@ant-design/icons-vue';
import { useClipboard } from '@vueuse/core';
import { MeButton, MeModal } from '@zyf_dsb/me-ui';
import { disableShareApi, enableShareApi, getShareStatusApi } from '@/api/page';

defineOptions({
  name: 'ShareModal',
});

/** 弹窗开关 */
const open = defineModel<boolean>('open', { required: true });

const props = defineProps({
  /** 画布页面 ID */
  pageId: {
    type: Number,
    required: true,
  },
});

/** 分享是否已开启 */
const shared = ref(false);
/** 当前分享令牌 */
const shareToken = ref('');
/** 开关加载态 */
const loading = ref(false);

/** 完整分享链接 */
const shareUrl = computed(() =>
  shareToken.value ? `${location.origin}/canvas/${props.pageId}?share=${shareToken.value}` : '',
);

const { copy } = useClipboard();

/** 打开弹窗时拉取当前分享状态 */
watch(open, async (visible) => {
  if (!visible) return;
  try {
    const data = await getShareStatusApi({ id: props.pageId });
    shareToken.value = data.shareToken;
    shared.value = !!data.shareToken;
  } catch {
    /* 获取失败保持关闭状态 */
  }
});

/** 开关分享 */
async function handleToggle(checked: boolean) {
  loading.value = true;
  try {
    if (checked) {
      const data = await enableShareApi({ id: props.pageId });
      shareToken.value = data.shareToken;
      shared.value = true;
    } else {
      await disableShareApi({ id: props.pageId });
      shareToken.value = '';
      shared.value = false;
    }
  } finally {
    loading.value = false;
  }
}

/** 复制链接到剪贴板 */
async function handleCopy() {
  await copy(shareUrl.value);
  message.success('链接已复制');
}
</script>

<style scoped lang="less">
.share-modal {
  &-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &-label {
    font-size: 14px;
    color: var(--editor-text);
  }

  &-tip {
    margin: 8px 0 12px;
    font-size: 12px;
    color: var(--editor-text-secondary);
  }

  &-link {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 8px;
    border: 1px solid var(--editor-border);
    border-radius: 4px;
    background: var(--editor-bg-item-hover);
  }

  &-url {
    flex: 1;
    font-size: 12px;
    color: var(--editor-text-secondary);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
