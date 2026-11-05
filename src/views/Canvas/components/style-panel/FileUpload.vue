<!-- ? 本地文件上传按钮 -->
<template>
  <div class="file-upload">
    <me-button :loading="isUploading" @click="handleFilePick">
      <UploadOutlined />
      上传文件
    </me-button>
    <a-progress v-if="isUploading" :percent="uploadPercent" size="small" class="file-upload-progress" />
    <input ref="fileInputRef" type="file" class="file-upload-input" :accept="accept" @change="handleFileChange" />
  </div>
</template>

<script lang="ts" setup>
import { ref, onUnmounted } from 'vue';
import { message } from 'ant-design-vue';
import { UploadOutlined } from '@ant-design/icons-vue';
import { MeButton } from '@zyf_dsb/me-ui';
import { nanoid } from 'nanoid';
import { uploadFile, cancelTask, type UploadFile } from '@/utils/chunked-upload';

defineOptions({
  name: 'FileUpload',
});

defineProps({
  /** 文件选择框 accept 限制 */
  accept: {
    type: String,
    default: '*/*',
  },
});

const emit = defineEmits<{
  /** 上传成功，回传文件访问 URL */
  (e: 'success', url: string): void;
}>();

/** 隐藏的文件选择框 */
const fileInputRef = ref<HTMLInputElement>();

/** 是否正在上传 */
const isUploading = ref(false);

/** 上传进度（0-100） */
const uploadPercent = ref(0);

/** 当前上传任务的 uid（无任务时为 undefined） */
let uploadingUid: string | undefined;

/** 组件卸载时取消进行中的上传（已传分片保留在服务端，重传可续） */
onUnmounted(() => {
  if (uploadingUid) cancelTask(uploadingUid);
});

/** 点击按钮触发隐藏文件选择框 */
function handleFilePick() {
  fileInputRef.value?.click();
}

/** 选中文件后分片断点续传，完成后 emit 文件访问 URL */
async function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';
  if (!file) return;
  isUploading.value = true;
  uploadPercent.value = 0;
  const uid = nanoid();
  (file as UploadFile).uid = uid;
  uploadingUid = uid;
  try {
    const url = await uploadFile(file, (percent) => {
      uploadPercent.value = percent;
    });
    message.success('文件上传成功');
    emit('success', url);
  } catch (error) {
    // 组件卸载触发的取消不提示错误
    if ((error as Error).name !== 'AbortError') {
      message.error((error as Error).message || '文件上传失败');
    }
  } finally {
    uploadingUid = undefined;
    isUploading.value = false;
  }
}
</script>

<style scoped lang="less">
.file-upload {
  &-input {
    display: none;
  }

  &-progress {
    margin-top: 8px;
  }
}
</style>
