/**
 * 分片信息
 */
export interface ChunkDescriptor {
  /**
   * 分片序号
   */
  index: number;
  /**
   * 分片内容 MD5
   */
  hash: string;
}

/**
 * 上传检查请求
 */
export interface FileCheckBody {
  /**
   * 文件 MD5
   */
  fileHash: string;
  /**
   * 原始文件名
   */
  fileName: string;
  /**
   * 文件大小（字节）
   */
  size: number;
  /**
   * 分片信息列表
   */
  chunks: ChunkDescriptor[];
}

/**
 * 分片上传参数
 */
export interface FileChunkParams {
  /**
   * 文件 MD5
   */
  fileHash: string;
  /**
   * 原始文件名
   */
  fileName: string;
  /**
   * 分片序号
   */
  chunkIndex: number;
  /**
   * 分片内容 MD5
   */
  chunkHash: string;
  /**
   * 分片总数
   */
  totalChunks: number;
}

/**
 * 上传检查响应
 */
export interface FileCheckResult {
  /**
   * 文件已存在时的访问地址（秒传）
   */
  url?: string;
  /**
   * 缺失的分片序号列表
   */
  needed?: number[];
}

/**
 * 分片上传响应
 */
export interface FileChunkResult {
  /**
   * 全部分片到齐合并后的访问地址
   */
  url?: string;
}
