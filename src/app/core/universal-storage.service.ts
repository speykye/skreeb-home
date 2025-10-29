import { Injectable } from '@angular/core';
import { isBrowser } from './platform.util';

@Injectable({ providedIn: 'root' })
export class UniversalStorage {
  private readonly browser = isBrowser();

  // ---- localStorage ----
  getItem(key: string): string | null {
    return this.browser ? localStorage.getItem(key) : null;
  }
  setItem(key: string, value: string): void {
    if (this.browser) localStorage.setItem(key, value);
  }
  removeItem(key: string): void {
    if (this.browser) localStorage.removeItem(key);
  }
  clear(): void {
    if (this.browser) localStorage.clear();
  }
  get length(): number {
    return this.browser ? localStorage.length : 0;
  }
  key(index: number): string | null {
    return this.browser ? localStorage.key(index) : null;
  }

  // ---- sessionStorage（可选）----
  sGetItem(key: string): string | null {
    return this.browser ? sessionStorage.getItem(key) : null;
  }
  sSetItem(key: string, value: string): void {
    if (this.browser) sessionStorage.setItem(key, value);
  }
  sRemoveItem(key: string): void {
    if (this.browser) sessionStorage.removeItem(key);
  }
  sClear(): void {
    if (this.browser) sessionStorage.clear();
  }
}
