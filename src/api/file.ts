import request from '@/utils/request';

import type { FileCheckBody, FileCheckResult, FileChunkParams, FileChunkResult } from './model/file';

const Api = {
  /** 上传检查 */
  FileCheck: '/files/check',
  /** 分片上传 */
  FileChunk: '/files/chunk',
};

/** 检查上传状态：返回秒传地址或缺失分片列表 */
export const checkFileApi = (data: FileCheckBody) => {
  return request.post<FileCheckResult>({ url: Api.FileCheck, data });
};

/** 上传一个分片（multipart/form-data，分片字段名 chunk） */
export const uploadChunkApi = (params: FileChunkParams, chunk: Blob, signal?: AbortSignal) => {
  const formData = new FormData();
  formData.append('fileHash', params.fileHash);
  formData.append('fileName', params.fileName);
  formData.append('chunkIndex', String(params.chunkIndex));
  formData.append('chunkHash', params.chunkHash);
  formData.append('totalChunks', String(params.totalChunks));
  formData.append('chunk', chunk);
  return request.post<FileChunkResult>({
    url: Api.FileChunk,
    data: formData,
    timeout: 60000,
    signal,
  });
};
