import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { environment } from '../../../environments/environment';
import { VisitorService } from './visitor.service';
import { throwError, catchError } from 'rxjs';

export const apiBaseUrlInterceptor: HttpInterceptorFn = (req, next) => {
  // 只改写以 /api/ 开头的相对路径
  if (req.url.startsWith('/api/')) {
    const url = environment.apiBase + req.url.replace('/api', '');
    req = req.clone({ url });
  }
  return next(req);
};

export const visitorAndLocaleInterceptor: HttpInterceptorFn = (req, next) => {
  const vs = inject(VisitorService);

  const headers: Record<string, string> = {
    'X-Visitor-Id': vs.visitorId,
    'Accept-Language': vs.locale || environment.defaultLocale,
  };

  // 如未来接入登录，这里加 Bearer（如果没有就不加）
  const token = localStorage.getItem('sk_access_token');
  if (token) headers['Authorization'] = `Bearer ${token}`;

  req = req.clone({ setHeaders: headers });
  return next(req);
};

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        const apiErr = {
          url: req.url,
          status: err.status,
          code: (err.error && (err.error.code || err.error.error)) ?? 'HTTP_ERROR',
          message: (err.error && (err.error.message)) ?? err.message ?? 'Network error',
        };
        // 这里可以接入全局通知，或上报日志
        console.error('API Error', apiErr);
        return throwError(() => apiErr);
      }
      return throwError(() => err);
    })
  );
};