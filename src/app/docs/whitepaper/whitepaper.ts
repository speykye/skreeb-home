import { Component, ElementRef, ViewChild, inject, DestroyRef, signal } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DocsService } from '../docs.service';
import { RecordEventService } from '../../core/services/record-event.service';
import { Router, ActivatedRoute } from '@angular/router';
import { firstValueFrom } from 'rxjs';

type Identity = 'client' | 'creator';

@Component({
  selector: 'app-whitepaper',
  standalone: true,                     // 如果你走 standalone 路由
  imports: [],              // 如果不是 standalone，可删掉这两行并放进 NgModule
  templateUrl: './whitepaper.html',
  styleUrls: ['./whitepaper.scss'],     // 注意复数
})
export class Whitepaper {
  private api = inject(DocsService);
  private s = inject(DomSanitizer);
  private destroyRef = inject(DestroyRef);  // 显式注入 DestroyRef
  private record = inject(RecordEventService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  @ViewChild('content', { static: false }) contentRef?: ElementRef<HTMLElement>;

  html: SafeHtml = '';
  error = signal<string | null>(null);

  async ngOnInit() {
    this.api.getDoc('whitepaper', 'en', { channel: 'web' })
      .pipe(takeUntilDestroyed(this.destroyRef))   // ✅ 传入 DestroyRef
      .subscribe({
        next: (d) => {
          const bodyHtml = d?.body_html ?? '';
          const enhanced = this.enhanceHtml(bodyHtml);
          // 假设后端已做安全清洗；否则用 Angular 默认 sanitizer（不要 bypass）
          this.html = this.s.bypassSecurityTrustHtml(enhanced);
        },
        error: (err) => {
          this.error.set('Failed to load whitepaper.');
          console.error(err);
        },
      });
    // 1) 读取路由查询参数
    const qp = this.route.snapshot.queryParamMap;
    const p_event_key = (qp.get('p_event_key') ?? 'whitepaper').trim();
    const qpIdentity = qp.get('p_identity') as Identity | null;

    // 2) identity 回退：query -> localStorage -> 'client'
    const lsIdentity = (safeGetLocal('skreeb.role') as Identity | null);
    const p_identity: Identity = (qpIdentity === 'client' || qpIdentity === 'creator')
      ? qpIdentity
      : (lsIdentity === 'client' || lsIdentity === 'creator')
        ? lsIdentity
        : 'client';

    const buttonId = (qp.get('buttonId') ?? 'page-auto').trim();

    // 3) 规范化路径（去掉查询串）
    const p_path = this.router.url.split('?')[0] || location.pathname;

    // 4) 确保 sessionId
    const p_session_id = await this.record.ensureSessionId();

    // 5) 上报埋点（用 firstValueFrom 等待一次完成）
    await firstValueFrom(
      this.record.recordEvent({
        p_event_key,
        p_session_id,
        p_identity,
        p_path,
        p_meta: { buttonId },
        p_window_seconds: 30,
      })
    );
  }

  /** 轻量增强：给 h1~h3 自动补 id、外链新窗口打开 */
  private enhanceHtml(src: string): string {
    if (!src) return src;
    const doc = new DOMParser().parseFromString(src, 'text/html');

    // 标题加 id
    const slugSet = new Set<string>();
    const slugify = (txt: string) => {
      const base = txt.toLowerCase().trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-');
      let s = base, i = 1;
      while (slugSet.has(s)) s = `${base}-${i++}`;
      slugSet.add(s);
      return s;
    };
    doc.body.querySelectorAll<HTMLElement>('h1, h2, h3').forEach(h => {
      if (!h.id) h.id = slugify(h.textContent ?? 'section');
    });

    // 外链新窗口
    doc.body.querySelectorAll<HTMLAnchorElement>('a[href]').forEach(a => {
      try {
        const href = a.getAttribute('href')!;
        const url = new URL(href, window.location.origin);
        if (url.origin !== window.location.origin) {
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
        }
      } catch { /* ignore */ }
    });

    return doc.body.innerHTML;
  }
  
}

/** 读取 localStorage 的小工具：非阻塞、容错 */
function safeGetLocal(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
