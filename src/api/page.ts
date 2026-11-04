import request from '@/utils/request';

import type { PageCreateBody, PageDetailParams, PageListItem, PageRenameBody, PageInfo, PageShareInfo } from './model/page';

const Api = {
  /** 我的画布 */
  Page: '/pages',
  /** 画布协作分享 */
  PageShare: '/pages/share',
};

/** 我的画布列表 */
export const listPagesApi = () => {
  return request.get<PageListItem[]>({ url: Api.Page });
};

/** 新建画布 */
export const createPageApi = (data: PageCreateBody) => {
  return request.post<PageInfo>({ url: Api.Page, data });
};

/** 重命名画布 */
export const renamePageApi = (data: PageRenameBody) => {
  return request.put<PageInfo>({ url: Api.Page, data });
};

/** 删除画布 */
export const deletePageApi = (params: PageDetailParams) => {
  return request.delete<null>({ url: Api.Page, params });
};

/** 画布分享状态 */
export const getShareStatusApi = (params: PageDetailParams) => {
  return request.get<PageShareInfo>({ url: Api.PageShare, params });
};

/** 开启协作分享，返回分享令牌 */
export const enableShareApi = (data: PageDetailParams) => {
  return request.post<PageShareInfo>({ url: Api.PageShare, data });
};

/** 关闭协作分享 */
export const disableShareApi = (data: PageDetailParams) => {
  return request.delete<null>({ url: Api.PageShare, data });
};
