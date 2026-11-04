import { computed } from 'vue';
import { defineStore } from 'pinia';
import { StorageSerializers, useStorage } from '@vueuse/core';
import { loginApi, logoutApi, registerApi } from '@/api/auth';
import type { LoginBody, RegisterBody, UserInfo } from '@/api/model/auth';

/** 访问令牌持久化存储 key */
const ACCESS_TOKEN_KEY = 'vibepage__access_token__';
/** 刷新令牌持久化存储 key */
const REFRESH_TOKEN_KEY = 'vibepage__refresh_token__';
/** 用户信息持久化存储 key */
const USER_INFO_KEY = 'vibepage__user_info__';

/** 认证 store */
export const useAuthStore = defineStore('auth', () => {
  /** 访问令牌 */
  const accessToken = useStorage<string>(ACCESS_TOKEN_KEY, '');
  /** 刷新令牌 */
  const refreshToken = useStorage<string>(REFRESH_TOKEN_KEY, '');
  /** 用户信息 */
  const userInfo = useStorage<UserInfo | null>(USER_INFO_KEY, null, localStorage, {
    serializer: StorageSerializers.object,
  });

  /** 是否已登录 */
  const isLoggedIn = computed(() => !!accessToken.value);

  /** 更新双令牌（登录与刷新后调用）*/
  function setTokens(access: string, refresh: string) {
    accessToken.value = access;
    refreshToken.value = refresh;
  }

  /** 清理登录态 */
  function clearAuth() {
    accessToken.value = '';
    refreshToken.value = '';
    userInfo.value = null;
  }

  /** 登录，成功后写入令牌与用户信息 */
  async function login(params: LoginBody) {
    const data = await loginApi(params);
    setTokens(data.accessToken, data.refreshToken);
    userInfo.value = data.userInfo;
  }

  /** 注册，成功后需要再登录 */
  async function registerUser(params: RegisterBody) {
    await registerApi(params);
  }

  /** 登出，作废服务端刷新令牌并清理本地登录态 */
  async function logout() {
    try {
      if (refreshToken.value) {
        await logoutApi({ refreshToken: refreshToken.value });
      }
    } finally {
      clearAuth();
    }
  }

  return {
    accessToken,
    refreshToken,
    userInfo,
    isLoggedIn,
    setTokens,
    clearAuth,
    login,
    registerUser,
    logout,
  };
});
