import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ContactService } from './service';
import { Router, ActivatedRoute } from '@angular/router';
import { RecordEventService } from '../../core/services/record-event.service';
import { firstValueFrom } from 'rxjs';
import { UniversalStorage } from '../../core/universal-storage.service';

type Identity = 'client' | 'creator';


@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  private storage = inject(UniversalStorage);
  private api = inject(ContactService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private record = inject(RecordEventService);

  roles = ['Client', 'Creator', 'Both', 'Other'] as const;
  topics = ['Support', 'Safety / Report', 'Partnerships', 'Press', 'Legal', 'Other'] as const;

  submitting = signal(false);
  submitted = signal(false);
  errorMsg = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    role: ['Client', []],
    topic: ['Support', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    agree: [true, [Validators.requiredTrue]],
  });

  get f() { return this.form.controls; }

  async submit() {
    this.submitted.set(true);
    this.errorMsg.set(null);
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.api.submit(this.form.getRawValue() as any).subscribe();
  }

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
