import { Component, inject, PLATFORM_ID } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { LoadingOverlay } from './shared/loading/loading-overlay/loading-overlay';
import { Role } from './shared/role/role';
import { isPlatformBrowser } from '@angular/common';
import { filter } from 'rxjs/operators';

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

    const send = (path: string) => {
      const bodyObj: Record<string, unknown> = {
        p_event_key: 'page_view',
        p_session_id: crypto.randomUUID(),
        p_identity: 'client',
        p_path: path,
        p_meta: { ts: Date.now() },
        p_window_seconds: 30
      };
      const payload = JSON.stringify(bodyObj);
      const url = 'https://api.skreeb.io/fn/record-event';

      if (navigator.sendBeacon) {
        // sendBeacon 接受 Blob/DOMString
        navigator.sendBeacon(url, new Blob([payload], { type: 'application/json' }));
      } else {
        // 回退到 fetch，body 必须是字符串
        void fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true,
          credentials: 'include'
        });
      }
    };

    // 首屏
    if (this.first) { send(location.pathname + location.search); this.first = false; }
    // 路由切换
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => send(e.urlAfterRedirects));
  }
}
