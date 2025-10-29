// src/app/shared/role/role.service.ts
import { DOCUMENT } from '@angular/common';
import { Injectable, effect, inject, signal } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { NavMeta, ROLE_STORAGE_KEY, RouteTarget, SESSION_STORAGE_KEY, SkreebRole } from './role.types';
import { UniversalStorage } from '../../core/universal-storage.service';

const DEFAULT_IDENTITY: SkreebRole = 'client'; // “稍后设置”或未知时的默认身份

@Injectable({ providedIn: 'root' })
export class RoleService {
  private storage = inject(UniversalStorage);
  private readonly doc = inject(DOCUMENT);
  private readonly router = inject(Router);

  /** 当前角色（null 表示未选择/未存） */
  readonly role = signal<SkreebRole | null>(this.readRole());
  /** 弹窗开关 */
  readonly openState = signal<boolean>(false);

  /** 临时缓存一次点击时的跳转参数（目标页 + 埋点） */
  private pendingTarget: RouteTarget | null = null;
  private pendingMeta: NavMeta | null = null;

  private lastFocusEl: HTMLElement | null = null;

  constructor() {
    // 同步角色到本地 + 全局事件 + body 属性
    effect(() => {
      const r = this.role();
      if (r) {
        this.safeSet(ROLE_STORAGE_KEY, r);
        window.dispatchEvent(new CustomEvent('skreeb:role-change', { detail: { role: r } }));
        this.doc.body.setAttribute('data-sk-role', r);
      } else {
        this.doc.body.removeAttribute('data-sk-role');
      }
    });
  }

  /** 页面按钮点击入口：先查 session，再决定直跳或弹窗 */
  enterOrAsk(target: RouteTarget, meta: NavMeta) {
    const hasSession = this.hasSession();
    if (hasSession) {
      // 已有 session：按“原逻辑”直跳
      const identity = this.role() ?? DEFAULT_IDENTITY;
      this.navigateWithParams(target, meta, identity);
    } else {
      // 无 session：弹窗，请用户先选角色
      this.pendingTarget = target;
      this.pendingMeta = meta;
      this.open();
    }
  }

  /** 选择角色后调用（由弹窗触发） */
  setRole(r: SkreebRole) {
    this.role.set(r);
    const target = this.pendingTarget;
    const meta = this.pendingMeta;
    this.pendingTarget = null;
    this.pendingMeta = null;
    this.close();
    if (target && meta) {
      this.navigateWithParams(target, meta, r);
    }
  }

  /** 稍后设置：关闭并跳相同目标页，p_identity 使用当前角色或默认 */
  skip() {
    const target = this.pendingTarget;
    const meta = this.pendingMeta;
    this.pendingTarget = null;
    this.pendingMeta = null;
    this.close();
    if (target && meta) {
      const identity = this.role() ?? DEFAULT_IDENTITY;
      this.navigateWithParams(target, meta, identity);
    }
  }

  // ── Modal 基础控制 ───────────────────────────
  open() {
    if (this.openState()) return;
    this.lastFocusEl = (this.doc.activeElement as HTMLElement) ?? null;
    this.openState.set(true);
    this.doc.body.style.overflow = 'hidden';
  }
  close() {
    if (!this.openState()) return;
    this.openState.set(false);
    this.doc.body.style.overflow = '';
    queueMicrotask(() => this.lastFocusEl?.focus?.());
  }

  // ── Helpers ─────────────────────────────────
  private hasSession(): boolean {
    try { return !!this.storage.getItem(SESSION_STORAGE_KEY); } catch { return false; }
  }
  private readRole(): SkreebRole | null {
    try {
      const v = this.storage.getItem(ROLE_STORAGE_KEY) as SkreebRole | null;
      return v === 'client' || v === 'creator' ? v : null;
    } catch { return null; }
  }
  private safeSet(key: string, val: string) {
    try { this.storage.setItem(key, val); } catch {}
  }
  private navigateWithParams(target: RouteTarget, meta: NavMeta, identity: SkreebRole) {
    const extras: NavigationExtras = {
      queryParams: {
        p_event_key: meta.p_event_key,
        p_identity: identity,    // 自动填：client/creator
        buttonId: meta.buttonId,
      }
    };
    if (Array.isArray(target)) this.router.navigate(target, extras);
    else this.router.navigateByUrl(target, extras);
  }
}
