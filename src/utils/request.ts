import axios, { AxiosError } from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse, CreateAxiosDefaults, InternalAxiosRequestConfig } from 'axios';
import { message } from 'ant-design-vue';
import { useAuthStore } from '@/store/auth';
import { refreshTokenApi } from '@/api/auth';
import { ResultCodeEnum } from '@/constants/result-code';
import router from '@/router';

/** 接口统一响应结构 */
interface Result<T = unknown> {
  /** 状态码，0 表示成功 */
  code: number;
  /** 提示信息（失败时返回） */
  message?: string;
  /** 响应数据（成功时返回） */
  data?: T;
}

/** Axios 封装：对外方法返回值为响应拦截器解包后的 Result.data */
class Request {
  /** axios 实例 */
  private readonly axiosInstance: AxiosInstance;

  constructor(options: CreateAxiosDefaults) {
    this.axiosInstance = axios.create(options);
  }

  /** 获取 axios 实例 */
  getAxios(): AxiosInstance {
    return this.axiosInstance;
  }

  /** 发送请求 */
  request<T>(config: AxiosRequestConfig): Promise<T> {
    return this.axiosInstance.request(config) as unknown as Promise<T>;
  }

  /** 发送 get 请求 */
  get<T>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'GET' });
  }

  /** 发送 post 请求 */
  post<T>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'POST' });
  }

  /** 发送 put 请求 */
  put<T>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'PUT' });
  }

  /** 发送 delete 请求 */
  delete<T>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'DELETE' });
  }

  /** 发送 patch 请求 */
  patch<T>(config: AxiosRequestConfig): Promise<T> {
    return this.request({ ...config, method: 'PATCH' });
  }
}

/** Request 实例 */
const request = new Request({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

/** axios 实例 */
const service = request.getAxios();

/** 已经过重试的请求配置集合 */
const retriedConfigs = new WeakSet<InternalAxiosRequestConfig>();

service.interceptors.request.use((config) => {
  const authStore = useAuthStore();
  if (authStore.accessToken) {
    config.headers.Authorization = `Bearer ${authStore.accessToken}`;
  }
  return config;
});

/** 是否为认证接口（登录/注册/刷新/登出不参与 401 重试） */
function isAuthApi(url?: string) {
  return url?.startsWith('/auth/') ?? false;
}

/** 刷新令牌中的共享 Promise，防止并发 401 时重复刷新 */
let refreshingPromise: Promise<void> | null = null;

/** 执行刷新：调用接口并更新本地令牌，结束后清空共享 Promise */
async function doRefresh(): Promise<void> {
  try {
    const authStore = useAuthStore();
    const data = await refreshTokenApi({ refreshToken: authStore.refreshToken });
    authStore.setTokens(data.accessToken, data.refreshToken);
  } finally {
    refreshingPromise = null;
  }
}

/** 调用刷新接口并更新本地令牌，并发调用时共享同一个 Promise */
function refreshAccessToken(): Promise<void> {
  if (!refreshingPromise) {
    refreshingPromise = doRefresh();
  }
  return refreshingPromise;
}

/** 令牌失效后的兜底处理：清理登录态并跳转登录页 */
function handleAuthExpired() {
  const authStore = useAuthStore();
  authStore.clearAuth();
  router.push('/login');
}

service.interceptors.response.use(
  async (response: AxiosResponse<Result>) => {
    const body = response.data;
    if (body.code === 0) {
      // 解包 data 直接返回，类型经由 Request 方法对外收敛
      return body.data as AxiosResponse<Result>;
    }

    // 会话永久失效或用户不存在时清理登录态并跳登录页
    if (body.code === ResultCodeEnum.FORCE_OFFLINE || body.code === ResultCodeEnum.USER_NOT_FOUND) {
      message.error(body.message ?? '请重新登录');
      handleAuthExpired();
      return Promise.reject(new Error(body.message));
    }

    // 发出本次请求时的完整请求配置
    const config = response.config;
    // 访问令牌过期：刷新后重试一次原请求
    if (body.code === ResultCodeEnum.UNAUTHORIZED && !retriedConfigs.has(config) && !isAuthApi(config.url)) {
      retriedConfigs.add(config);
      try {
        await refreshAccessToken();
        return await service(config);
      } catch {
        handleAuthExpired();
        return Promise.reject(new Error(body.message));
      }
    }

    message.error(body.message ?? '请求失败');
    return Promise.reject(new Error(body.message));
  },
  (error: AxiosError<Result>) => {
    message.error(error.response?.data?.message ?? '网络异常，请稍后重试');
    return Promise.reject(error);
  }
);

export default request;
