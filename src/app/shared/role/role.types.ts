// src/app/shared/role/role.types.ts
export type SkreebRole = 'client' | 'creator';

export const ROLE_STORAGE_KEY = 'skreeb.role';
export const SESSION_STORAGE_KEY = 'skreeb_session_id';

// 统一：只跳转一个页面
export type RouteTarget = string | any[]; // '/x' 或 Router commands

// 点击按钮时传入的导航元信息
export interface NavMeta {
  p_event_key: string; // 页面名称/埋点页名
  buttonId: string;    // 按钮名称/ID
}
