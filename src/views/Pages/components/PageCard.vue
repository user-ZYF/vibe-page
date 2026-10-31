<!-- 画布卡片 -->
<template>
  <div class="page-card" @click="emit('open', page.id)">
    <div class="page-card-cover">
      <img v-if="page.thumbnail" :src="page.thumbnail" class="page-card-cover-img" alt="" />
      <FileOutlined v-else class="page-card-cover-icon" />
    </div>
    <div class="page-card-body">
      <div class="page-card-title">{{ page.title }}</div>
      <div class="page-card-time">更新于 {{ formatTime(page.updatedAt) }}</div>
    </div>
    <div class="page-card-actions" @click.stop>
      <me-tooltip content="重命名" effect="light">
        <span class="page-card-action" @click="emit('rename', page)">
          <EditOutlined />
        </span>
      </me-tooltip>
      <span class="page-card-action page-card-action--danger" @click="emit('delete', page)">
        <DeleteOutlined />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { DeleteOutlined, EditOutlined, FileOutlined } from '@ant-design/icons-vue';
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
  position: relative;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #e8e9eb;
  overflow: hidden;
  cursor: pointer;
  transition: box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover {
    border-color: #c9cdd4;
    box-shadow: 0 4px 16px rgba(31, 35, 41, 0.08);

    .page-card-actions {
      opacity: 1;
    }
  }

  &-cover {
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f2f3f5;
  }

  &-cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: top;
  }

  &-cover-icon {
    font-size: 36px;
    color: #c9cdd4;
  }

  &-body {
    padding: 12px 16px;
  }

  &-title {
    font-size: 14px;
    font-weight: 500;
    color: #1f2329;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &-time {
    margin-top: 4px;
    font-size: 12px;
    color: #8f959e;
  }

  &-actions {
    position: absolute;
    top: 8px;
    right: 8px;
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  &-action {
    width: 28px;
    height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    background: rgba(255, 255, 255, 0.9);
    color: #4e5969;
    font-size: 14px;
    cursor: pointer;

    &:hover {
      color: #1677ff;
    }
  }

  &-action--danger:hover {
    color: #f53f3f;
  }
}
</style>
