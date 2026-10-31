<!-- 画布列表页 -->
<template>
  <div class="pages-page app-light-scope">
    <header class="pages-topbar">
      <span class="pages-logo">VibePage</span>
      <div class="pages-topbar-right">
        <span class="pages-user">{{ authStore.userInfo?.nickname || authStore.userInfo?.username }}</span>
        <span class="pages-logout" @click="handleLogout">退出登录</span>
      </div>
    </header>

    <main class="pages-main">
      <div class="pages-main-head">
        <h2 class="pages-heading">我的画布</h2>
        <me-button type="primary" @click="openCreateModal">
          <PlusOutlined />
          新建画布
        </me-button>
      </div>

      <a-spin :spinning="isLoading">
        <div v-if="pages.length" class="pages-grid">
          <PageCard
            v-for="page in pages"
            :key="page.id"
            :page="page"
            @open="openPage"
            @rename="openRenameModal"
            @delete="handleDelete" />
        </div>
        <a-empty v-else-if="!isLoading" description="还没有画布，点击右上角新建" />
      </a-spin>
    </main>

    <me-modal
      v-model:open="isModalOpen"
      modal-class-name="app-light-modal"
      :title="modalTitle"
      :confirm-loading="isModalSubmitting"
      @confirm="handleModalSubmit">
      <me-input v-model="modalInput" placeholder="请输入画布标题" :maxlength="100" />
    </me-modal>

    <me-modal
      v-model:open="isDeleteModalOpen"
      modal-class-name="app-light-modal"
      title="删除画布"
      confirm-text="删除"
      confirm-type="danger"
      :confirm-loading="isDeleting"
      @confirm="confirmDelete">
      确认删除「{{ deletingPage?.title }}」？删除后不可恢复。
    </me-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { PlusOutlined } from '@ant-design/icons-vue';
import { MeButton, MeInput, MeModal } from '@zyf_dsb/me-ui';
import { createPageApi, deletePageApi, listPagesApi, updatePageApi } from '@/api/page';
import type { PageListItem } from '@/api/model/page';
import { useAuthStore } from '@/store/auth';
import PageCard from './components/PageCard.vue';

defineOptions({ name: 'PagesPage' });

const router = useRouter();
const authStore = useAuthStore();

/** 画布列表 */
const pages = ref<PageListItem[]>([]);
/** 列表加载中 */
const isLoading = ref(false);

/** 标题弹窗是否打开 */
const isModalOpen = ref(false);
/** 弹窗标题 */
const modalTitle = ref('新建画布');
/** 弹窗输入值 */
const modalInput = ref('');
/** 弹窗提交中 */
const isModalSubmitting = ref(false);
/** 重命名目标页面 ID，为 null 表示当前是新建模式 */
const editingPageId = ref<number | null>(null);

/** 拉取画布列表 */
async function fetchPages() {
  isLoading.value = true;
  try {
    pages.value = await listPagesApi();
  } finally {
    isLoading.value = false;
  }
}

/** 打开画布编辑页 */
function openPage(id: number) {
  router.push(`/canvas/${id}`);
}

/** 打开新建弹窗 */
function openCreateModal() {
  editingPageId.value = null;
  modalTitle.value = '新建画布';
  modalInput.value = '';
  isModalOpen.value = true;
}

/** 打开重命名弹窗 */
function openRenameModal(page: PageListItem) {
  editingPageId.value = page.id;
  modalTitle.value = '重命名画布';
  modalInput.value = page.title;
  isModalOpen.value = true;
}

/** 弹窗提交：新建或重命名 */
async function handleModalSubmit() {
  const title = modalInput.value.trim();
  if (!title) {
    message.warning('请输入画布标题');
    return;
  }
  isModalSubmitting.value = true;
  try {
    if (editingPageId.value === null) {
      const page = await createPageApi({ title });
      isModalOpen.value = false;
      router.push(`/canvas/${page.id}`);
    } else {
      await updatePageApi({ id: editingPageId.value, title });
      isModalOpen.value = false;
      message.success('已重命名');
      await fetchPages();
    }
  } finally {
    isModalSubmitting.value = false;
  }
}

/** 删除确认弹窗是否打开 */
const isDeleteModalOpen = ref(false);
/** 待删除的画布 */
const deletingPage = ref<PageListItem | null>(null);
/** 删除提交中 */
const isDeleting = ref(false);

/** 打开删除确认弹窗 */
function handleDelete(page: PageListItem) {
  deletingPage.value = page;
  isDeleteModalOpen.value = true;
}

/** 确认删除画布 */
async function confirmDelete() {
  if (!deletingPage.value) return;
  isDeleting.value = true;
  try {
    await deletePageApi({ id: deletingPage.value.id });
    isDeleteModalOpen.value = false;
    message.success('已删除');
    await fetchPages();
  } finally {
    isDeleting.value = false;
  }
}

/** 退出登录 */
async function handleLogout() {
  await authStore.logout();
  router.push('/login');
}

onMounted(fetchPages);
</script>

<style lang="less" scoped>
.pages {
  &-page {
    min-height: 100vh;
    background: #f5f6f8;
  }

  &-topbar {
    height: 56px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border-bottom: 1px solid #e8e9eb;
  }

  &-logo {
    font-size: 17px;
    font-weight: 600;
    color: #1f2329;
    letter-spacing: 0.5px;
  }

  &-topbar-right {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  &-user {
    font-size: 14px;
    color: #4e5969;
  }

  &-logout {
    font-size: 14px;
    color: #4e5969;
    cursor: pointer;

    &:hover {
      color: #1677ff;
    }
  }

  &-main {
    max-width: 1080px;
    margin: 0 auto;
    padding: 32px 24px;
  }

  &-main-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  &-heading {
    font-size: 20px;
    font-weight: 600;
    color: #1f2329;
  }

  &-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}
</style>


