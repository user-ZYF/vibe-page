/**
 * 画布列表项
 */
export interface PageListItem {
  /**
   * 页面 ID
   */
  id: number;
  /**
   * 页面标题
   */
  title: string;
  /**
   * 创建时间（毫秒时间戳）
   */
  createdAt: number;
  /**
   * 更新时间（毫秒时间戳）
   */
  updatedAt: number;
}

/**
 * 画布详情
 */
export interface PageInfo {
  /**
   * 页面 ID
   */
  id: number;
  /**
   * 归属用户 ID
   */
  userId: number;
  /**
   * 页面标题
   */
  title: string;
  /**
   * 画布内容 JSON
   */
  content: string;
  /**
   * 创建时间（毫秒时间戳）
   */
  createdAt: number;
  /**
   * 更新时间（毫秒时间戳）
   */
  updatedAt: number;
}

/**
 * 新建画布请求
 */
export interface PageCreateBody {
  /**
   * 页面标题
   */
  title: string;
  /**
   * 初始画布数据（JSON 字符串）
   */
  content: string;
}

/**
 * 画布操作（删除/分享）参数
 */
export interface PageDetailParams {
  /**
   * 页面 ID
   */
  id: number;
}

/**
 * 重命名画布请求
 */
export interface PageRenameBody {
  /**
   * 页面 ID
   */
  id: number;
  /**
   * 页面标题
   */
  title: string;
}

/**
 * 画布分享状态/开启分享响应
 */
export interface PageShareInfo {
  /**
   * 分享令牌（未开启为空串）
   */
  shareToken: string;
}
