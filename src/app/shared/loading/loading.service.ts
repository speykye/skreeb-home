import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  // 并发计数：>0 表示显示 Loading
  private _count = signal(0);
  readonly active = computed(() => this._count() > 0);

  // 防闪烁：最短显示 300ms（只在计数将回到 0 时生效）
  private lastStartAt = 0;
  private readonly minVisibleMs = 300;

  start(): void {
    if (this._count() === 0) this.lastStartAt = performance.now();
    this._count.update(c => c + 1);
  }

  stop(): void {
    const shouldDelay = this._count() <= 1 &&
      (performance.now() - this.lastStartAt) < this.minVisibleMs;

    const finish = () => this._count.update(c => Math.max(0, c - 1));
    shouldDelay ? setTimeout(finish, this.minVisibleMs - (performance.now() - this.lastStartAt)) : finish();
  }

  /** 便捷方法：追踪一个 Promise 的加载态 */
  async track<T>(p: Promise<T>): Promise<T> {
    this.start();
    try { return await p; }
    finally { this.stop(); }
  }
}
