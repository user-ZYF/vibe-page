<!-- 登录/注册页 -->
<template>
  <div class="login-page app-light-scope">
    <div class="login-card">
      <h1 class="login-title">VibePage</h1>
      <div class="login-tabs">
        <span
          class="login-tab"
          :class="{ 'is-active': mode === AuthModeEnum.LOGIN }"
          @click="mode = AuthModeEnum.LOGIN">
          账号登录
        </span>
        <span
          class="login-tab"
          :class="{ 'is-active': mode === AuthModeEnum.REGISTER }"
          @click="mode = AuthModeEnum.REGISTER">
          注册账号
        </span>
      </div>
      <me-form
        ref="formRef"
        size="large"
        :data="form"
        :rules="rules"
        @submit="handleSubmit">
        <me-form-item label="用户名" prop-path="username">
          <me-input v-model="form.username" placeholder="请输入用户名" clearable />
        </me-form-item>
        <me-form-item label="密码" prop-path="password">
          <me-input
            v-model="form.password"
            type="password"
            placeholder="请输入密码"
            show-password />
        </me-form-item>
        <me-form-item v-if="isRegister" label="昵称" prop-path="nickname">
          <me-input v-model="form.nickname" placeholder="选填" clearable />
        </me-form-item>
        <me-form-item>
          <me-button type="primary" native-type="submit" :loading="isSubmitting" class="login-submit">
            {{ isRegister ? '注册' : '登录' }}
          </me-button>
        </me-form-item>
      </me-form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { message } from 'ant-design-vue';
import { MeButton, MeForm, MeFormItem, MeInput } from '@zyf_dsb/me-ui';
import type { FormRules } from '@zyf_dsb/me-ui/form';
import { useAuthStore } from '@/store/auth';
import { AuthModeEnum } from '@/constants/auth';

defineOptions({ name: 'LoginPage' });

/** MeForm 暴露的方法 */
interface LoginFormInstance {
  /** 校验整个表单 */
  validate: () => Promise<boolean>;
  /** 重置字段并移除校验结果 */
  resetFormItems: (propPaths?: string | string[]) => void;
  /** 清除指定字段的校验信息 */
  clearValidate: (propPaths?: string | string[]) => void;
}

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

/** 当前模式：登录 / 注册 */
const mode = ref<AuthModeEnum>(AuthModeEnum.LOGIN);
/** 是否为注册模式 */
const isRegister = computed(() => mode.value === AuthModeEnum.REGISTER);
/** 表单实例 */
const formRef = ref<LoginFormInstance>();
/** 表单数据 */
const form = ref({
  /** 用户名 */
  username: '',
  /** 密码 */
  password: '',
  /** 昵称 */
  nickname: '',
});
/** 提交中标记，用于按钮 loading 防重复点击 */
const isSubmitting = ref(false);

/** 表单校验规则 */
const rules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 50, message: '长度需在 3-50 之间', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 64, message: '长度需在 6-64 之间', trigger: 'blur' },
  ],
};

/** 切换模式时重置表单 */
watch(mode, () => {
  formRef.value?.resetFormItems();
  formRef.value?.clearValidate();
});

/** 提交表单（MeForm 校验通过后触发） */
async function handleSubmit() {
  isSubmitting.value = true;
  try {
    if (isRegister.value) {
      await authStore.registerUser({
        username: form.value.username,
        password: form.value.password,
        nickname: form.value.nickname || undefined,
      });
      message.success('注册成功，请登录');
      mode.value = AuthModeEnum.LOGIN;
    } else {
      await authStore.login({
        username: form.value.username,
        password: form.value.password,
      });
      message.success('登录成功');
      const redirect = typeof route.query.redirect === 'string' ? route.query.redirect : '/';
      router.push(redirect);
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style lang="less" scoped>
.login {
  &-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #f5f6f8;
  }

  &-card {
    width: 400px;
    padding: 40px 40px 32px;
    border-radius: 8px;
    background: #fff;
    box-shadow: 0 2px 16px rgba(31, 35, 41, 0.06);
  }

  &-title {
    margin-bottom: 24px;
    font-size: 22px;
    font-weight: 600;
    color: #1f2329;
    text-align: center;
    letter-spacing: 0.5px;
  }

  &-tabs {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-bottom: 24px;
    border-bottom: 1px solid #f0f1f3;
  }

  &-tab {
    padding: 0 4px 12px;
    font-size: 15px;
    color: #8f959e;
    cursor: pointer;
    border-bottom: 2px solid transparent;
    transition: color 0.2s ease, border-color 0.2s ease;

    &:hover {
      color: #1f2329;
    }

    &.is-active {
      color: #1677ff;
      font-weight: 500;
      border-bottom-color: #1677ff;
    }
  }

  &-submit {
    width: 100%;
    margin-top: 4px;
  }
}
</style>
