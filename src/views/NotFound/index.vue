<!-- 404 页面 -->
<template>
  <div class="not-found-page">
    <div class="not-found-code">404</div>
    <div class="not-found-desc">抱歉，您访问的页面不存在</div>
    <me-button type="primary" @click="handleGoHome">返回首页</me-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { MeButton } from '@zyf_dsb/me-ui';

defineOptions({ name: 'NotFoundPage' });

const router = useRouter();

/** 返回首页 */
function handleGoHome() {
  router.push('/');
}
</script>

<style lang="less" scoped>
.not-found {
  &-page {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: #f5f6f8;
  }

  &-code {
    font-size: 96px;
    font-weight: 700;
    line-height: 1;
    color: #1677ff;
    letter-spacing: 4px;
  }

  &-desc {
    margin: 16px 0 32px;
    font-size: 15px;
    color: #8f959e;
  }
}
</style>
