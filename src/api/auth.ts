import request from '@/utils/request';

import type { LoginBody, LoginResult, RefreshTokenBody, RegisterBody, UserInfo } from './model/auth';

const Api = {
  /** 登录 */
  Login: '/auth/login',
  /** 注册 */
  Register: '/auth/register',
  /** 刷新令牌 */
  RefreshToken: '/auth/refresh',
  /** 登出 */
  Logout: '/auth/logout',
};

/** 登录 */
export const loginApi = (data: LoginBody) => {
  return request.post<LoginResult>({ url: Api.Login, data });
};

/** 注册 */
export const registerApi = (data: RegisterBody) => {
  return request.post<UserInfo>({ url: Api.Register, data });
};

/** 刷新令牌，换取新的双令牌 */
export const refreshTokenApi = (data: RefreshTokenBody) => {
  return request.post<LoginResult>({ url: Api.RefreshToken, data });
};

/** 登出，作废刷新令牌 */
export const logoutApi = (data: RefreshTokenBody) => {
  return request.post<null>({ url: Api.Logout, data });
};
