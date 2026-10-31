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
   * 画布缩略图（base64 PNG）
   */
  thumbnail: string;
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
   * 画布内容 JSON，不传则为空画布
   */
  content?: string;
}

/**
 * 画布操作（详情/删除）参数
 */
export interface PageDetailParams {
  /**
   * 页面 ID
   */
  id: number;
}

/**
 * 更新画布请求
 */
export interface PageUpdateBody {
  /**
   * 页面 ID
   */
  id: number;
  /**
   * 页面标题
   */
  title?: string;
  /**
   * 画布内容 JSON
   */
  content?: string;
  /**
   * 画布缩略图（base64 PNG）
   */
  thumbnail?: string;
}
