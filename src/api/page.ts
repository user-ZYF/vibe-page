import request from '@/utils/request';

import type { PageCreateBody, PageDetailParams, PageListItem, PageUpdateBody, PageInfo } from './model/page';

const Api = {
  /** 我的画布 */
  Page: '/pages',
  /** 画布详情 */
  PageDetail: '/pages/detail',
};

/** 我的画布列表 */
export const listPagesApi = () => {
  return request.get<PageListItem[]>({ url: Api.Page });
};

/** 新建画布 */
export const createPageApi = (data: PageCreateBody) => {
  return request.post<PageInfo>({ url: Api.Page, data });
};

/** 画布详情 */
export const getPageApi = (params: PageDetailParams) => {
  return request.get<PageInfo>({ url: Api.PageDetail, params });
};

/** 保存画布 */
export const updatePageApi = (data: PageUpdateBody) => {
  return request.put<PageInfo>({ url: Api.Page, data });
};

/** 删除画布 */
export const deletePageApi = (params: PageDetailParams) => {
  return request.delete<null>({ url: Api.Page, params });
};
