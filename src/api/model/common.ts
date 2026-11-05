/**
 * 接口统一响应结构
 */
export interface Result<T = unknown> {
  /**
   * 状态码，0 表示成功
   */
  code: number;
  /**
   * 提示信息（失败时返回）
   */
  message?: string;
  /**
   * 响应数据（成功时返回）
   */
  data?: T;
}
