/**
 * 用户信息
 */
export interface UserInfo {
  /**
   * 用户 ID
   */
  id: number;
  /**
   * 用户名   */
  username: string;
  /**
   * 昵称
   */
  nickname: string;
  /**
   * 头像地址
   */
  avatar: string;
  /**
   * 创建时间（毫秒时间戳）
   */
  createdAt: number;
}

/**
 * 登录请求
 */
export interface LoginBody {
  /**
   * 用户名   */
  username: string;
  /**
   * 密码
   */
  password: string;
}

/**
 * 注册请求
 */
export interface RegisterBody extends LoginBody {
  /**
   * 昵称
   */
  nickname?: string;
}

/**
 * 刷新令牌请求
 */
export interface RefreshTokenBody {
  /**
   * 刷新令牌
   */
  refreshToken: string;
}

/**
 * 登录/刷新响应
 */
export interface LoginResult {
  /**
   * 访问令牌
   */
  accessToken: string;
  /**
   * 刷新令牌
   */
  refreshToken: string;
  /**
   * 用户信息
   */
  userInfo: UserInfo;
}
