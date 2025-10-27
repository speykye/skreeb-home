import { Injectable } from '@angular/core';
import { ApiClient } from '../core/http/api-client.service';

type DocResp = { id: string; title: string; updated_at: string; body_html: string };

@Injectable({ providedIn: 'root' })
export class DocsService {
  constructor(private api: ApiClient) { }

  getDoc(type: string, locale = 'en', opts?: { channel?: 'web' | 'app' | 'ios' | 'android', version?: number }) {
    const p = new URLSearchParams({type, locale, channel: opts?.channel ?? 'web' });
    if (opts?.version) p.set('version', String(opts.version));
    return this.api.get<DocResp>(`/api/fn/legal?${p.toString()}`);
  }
}