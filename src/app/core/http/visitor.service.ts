import { inject, Injectable } from '@angular/core';
import { UniversalStorage } from '../universal-storage.service';

const KEY = 'sk_vsid';

@Injectable({ providedIn: 'root' })
export class VisitorService {
  private storage = inject(UniversalStorage);
  private id = this.ensure();

  private ensure() {
    let v = this.storage.getItem(KEY);
    if (!v) {
      v = crypto.randomUUID();
      this.storage.setItem(KEY, v);
    }
    return v;
  }

  get visitorId() { return this.id; }

  // 你也可以把语言做切换持久化
  get locale() {
    return this.storage.getItem('sk_locale') || 'en';
  }
}