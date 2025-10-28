import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling  } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { apiBaseUrlInterceptor, visitorAndLocaleInterceptor, apiErrorInterceptor } from './core/http/interceptors';
import { loadingInterceptor } from './core/http/loading.interceptor';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes,
      withInMemoryScrolling({
        // 新导航：滚到顶部；后退/前进：也滚到顶部（不要还原旧位置）
        scrollPositionRestoration: 'top',
        // 允许 URL 带 #fragment 时自动滚到锚点
        anchorScrolling: 'enabled'
      }),
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        apiBaseUrlInterceptor,
        visitorAndLocaleInterceptor,
        apiErrorInterceptor,
        loadingInterceptor
      ])
    ), provideClientHydration(withEventReplay())
  ]
};
