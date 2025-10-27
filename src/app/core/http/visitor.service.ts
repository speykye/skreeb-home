import { Injectable } from '@angular/core';

const KEY = 'sk_vsid';

@Injectable({ providedIn: 'root' })
export class VisitorService {
  private id = this.ensure();

  private ensure() {
    let v = localStorage.getItem(KEY);
    if (!v) {
      v = crypto.randomUUID();
      localStorage.setItem(KEY, v);
    }
    return v;
  }

  get visitorId() { return this.id; }

  // 你也可以把语言做切换持久化
  get locale() {
    return localStorage.getItem('sk_locale') || navigator.language || 'en';
  }
}