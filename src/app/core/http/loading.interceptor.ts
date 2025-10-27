import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { LoadingService } from '../../shared/loading/loading.service';

// 可按需调整：忽略静态资源/健康检查等
const EXCLUDE: RegExp[] = [/\/assets\//, /\.svg(\?|$)/, /\/healthz$/];

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  if (EXCLUDE.some(rx => rx.test(req.url))) {
    return next(req);
  }
  const loading = inject(LoadingService);
  loading.start();
  return next(req).pipe(finalize(() => loading.stop()));
};
