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
      const body = JSON.stringify({ type: 'pageview', path, ts: Date.now() });
      navigator.sendBeacon?.('https://api.skreeb.io/fn/record-event', new Blob([body], { type: 'application/json' }))
        || fetch('https://api.skreeb.io/fn/record-event', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true });
    };

    // 首屏
    if (this.first) { send(location.pathname + location.search); this.first = false; }
    // 路由切换
    this.router.events.pipe(filter(e => e instanceof NavigationEnd))
      .subscribe((e: any) => send(e.urlAfterRedirects));
  }
}
