import { Component, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { LoadingOverlay } from './shared/loading/loading-overlay/loading-overlay';
import { Role } from './shared/role/role';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs/operators';
import { environment  } from '../environments/environment';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LoadingOverlay, Role],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private router = inject(Router);
  private pid = inject(PLATFORM_ID);
  private first = true;

  ngOnInit() {
    if (!isPlatformBrowser(this.pid)) return;
    const ANON = environment.supabase.anonKey;
    const send = (path: string) => {
      const bodyObj = {
        p_event_key: 'page_view',
        p_session_id: crypto.randomUUID(),
        p_identity: 'client',
        p_path: path,
        p_meta: { ts: Date.now() },
        p_window_seconds: 30
      };
      const url = 'https://api.skreeb.io/fn/record-event';

      // 统一用 fetch，带上 Cookie（给 Zero Trust 看）
      return fetch(url, {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          // 你的后端如果是 Supabase Edge Function，通常需要这两头
          'authorization': `Bearer ${ANON}`,
          'apikey': ANON,
        },
        body: JSON.stringify(bodyObj),
        keepalive: true,
        credentials: 'include',   // ← 关键：带上 CF_Authorization
        mode: 'cors',
      }).catch(() => {});
    };

    // 首屏
    if (this.first) { send(location.pathname + location.search); this.first = false; }
    // 路由切换
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => send(e.urlAfterRedirects));
  }
}
