import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export type ApiEnvelope<T> = { data: T; message?: string };

@Injectable({ providedIn: 'root' })
export class ApiClient {
  constructor(private http: HttpClient) {}

  get<T>(path: string, params?: Record<string, any>): Observable<T> {
    const p = new HttpParams({ fromObject: params ?? {} });
    return this.http.get<ApiEnvelope<T>>(path, { params: p }).pipe(map(r => r.data));
  }

  post<T>(path: string, body?: any): Observable<T> {
    return this.http.post<ApiEnvelope<T>>(path, body).pipe(map(r => r.data));
  }

  put<T>(path: string, body?: any): Observable<T> {
    return this.http.put<ApiEnvelope<T>>(path, body).pipe(map(r => r.data));
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<ApiEnvelope<T>>(path).pipe(map(r => r.data));
  }
}