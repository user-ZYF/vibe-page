<!-- 画布卡片 -->
<template>
  <div class="page-card" @click="emit('open', page.id)">
    <div class="page-card-window">
      <div class="page-card-window-bar">
        <span class="page-card-window-dot page-card-window-dot--red"></span>
        <span class="page-card-window-dot page-card-window-dot--yellow"></span>
        <span class="page-card-window-dot page-card-window-dot--green"></span>
      </div>
      <div class="page-card-window-body">
        <div class="page-card-title">{{ page.title }}</div>
      </div>
    </div>
    <div class="page-card-footer">
      <div class="page-card-time">更新于 {{ formatTime(page.updatedAt) }}</div>
      <div class="page-card-actions" @click.stop>
        <me-tooltip content="重命名" effect="light">
          <span class="page-card-action" @click="emit('rename', page)">
            <EditOutlined />
          </span>
        </me-tooltip>
        <me-tooltip content="删除" effect="light">
          <span class="page-card-action page-card-action--danger" @click="emit('delete', page)">
            <DeleteOutlined />
          </span>
        </me-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DeleteOutlined, EditOutlined } from '@ant-design/icons-vue';
import { MeTooltip } from '@zyf_dsb/me-ui';
import type { PageListItem } from '@/api/model/page';

defineOptions({ name: 'PageCard' });

defineProps({
  /** 画布信息 */
  page: {
    type: Object as () => PageListItem,
    required: true,
  },
});

const emit = defineEmits<{
  (e: 'open', id: number): void;
  (e: 'rename', page: PageListItem): void;
  (e: 'delete', page: PageListItem): void;
}>();

/** 格式化时间 */
function formatTime(value: number) {
  const date = new Date(value);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
</script>

<style lang="less" scoped>
.page-card {
  border-radius: 10px;
  background: #fff;
  border: 1px solid #e8e9eb;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s ease, border-color 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: #d4d7dc;
    box-shadow: 0 8px 24px rgba(31, 35, 41, 0.1);
    transform: translateY(-2px);

    .page-card-actions {
      opacity: 1;
    }
  }

  /* mac 风格窗口 */
  &-window {
    border-bottom: 1px solid #f0f1f3;
  }

  &-window-bar {
    height: 30px;
    padding: 0 12px;
    display: flex;
    align-items: center;
    gap: 6px;
    background: #f5f6f7;
    border-bottom: 1px solid #eceef0;
  }

  &-window-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;

    &--red { background: #ff5f57; }
    &--yellow { background: #febc2e; }
    &--green { background: #28c840; }
  }

  &-window-body {
    height: 110px;
    padding: 0 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &-title {
    font-size: 16px;
    font-weight: 600;
    color: #1f2329;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100%;
  }

  &-footer {
    position: relative;
    padding: 10px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 40px;
  }

  &-time {
    font-size: 12px;
    color: #8f959e;
  }

  &-actions {
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &-action {
    width: 26px;
    height: 26px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    color: #4e5969;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      background: #f2f3f5;
      color: #1677ff;
    }
  }

  &-action--danger:hover {
    color: #f53f3f;
  }
}
</style>
