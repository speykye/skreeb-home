import { Component, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { RecordEventService } from '../../core/services/record-event.service';
import { firstValueFrom } from 'rxjs';
import { UniversalStorage } from '../../core/universal-storage.service';

type ChangeItem = { text: string, href?: string, url?: string };
type Identity = 'client' | 'creator';


@Component({
  selector: 'app-about',
  imports: [RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  private storage = inject(UniversalStorage);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private record = inject(RecordEventService);

  problems = [
    { title: 'Newcomer discovery & negotiation', desc: 'Clear briefs and portfolio presentation reduce back-and-forth.' },
    { title: 'Messy process, costly disputes', desc: 'Milestones with audit-ready history keep work traceable.' },
    { title: 'Opaque, high platform cuts', desc: 'Tiered fees with caps, fully documented and versioned.' },
    { title: 'AI replacement worries', desc: 'AI assists; humans create and arbitrate.' },
  ];

  mvp = [
    'Role cards (Client / Creator) & reusable Brief templates',
    'In-order messaging with milestone approvals + delay/change/price requests',
    'Lightweight arbitration (AI summary → human decision)',
    'Safety & segmentation aligned with target markets',
    'Passkey-first login; minimal data',
  ];

  roadmap = [
    'MVP: roles, briefs, order + milestones, light arbitration, fee docs',
    'Phase 2: Chronicles, Creator Fund, Pro for verified companies',
  ];

  recentChanges: ChangeItem[] = [
    { text: 'US-first market focus; bilingual support for CN–US users' },
    { text: 'email-first; Passkey authentication fallback' },
    { text: 'Fee Schedule (tiers + caps) published and versioned', href: '/whitepaper' },
    { text: 'First-run role selection modal (Client / Creator)' },
    { text: 'One-page Whitepaper live; Company nav refined', href: '/whitepaper' },
    { text: 'FeeLens live', url: 'https://feelen.skreeb.io' }
  ];

  async ngOnInit() {
    // 1) 读取路由查询参数
    const qp = this.route.snapshot.queryParamMap;
    const p_event_key = (qp.get('p_event_key') ?? 'legal-doc').trim();
    const qpIdentity = qp.get('p_identity') as Identity | null;

    // 2) identity 回退：query -> localStorage -> 'client'
    const lsIdentity = (this.safeGetLocal('skreeb.role') as Identity | null);
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

  safeGetLocal(key: string): string | null {
    try { return this.storage.getItem(key); } catch { return null; }
  }
}
