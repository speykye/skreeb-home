import { Component, HostListener, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RoleService } from './role.service';

@Component({
  selector: 'app-role',
  imports: [CommonModule],
  templateUrl: './role.html',
  styleUrl: './role.scss',
})
export class Role {
  private readonly roleSvc = inject(RoleService);

  readonly isOpen = computed(() => this.roleSvc.openState());

  constructor() {
    effect(() => { if (this.isOpen()) queueMicrotask(() => document.querySelector<HTMLElement>('.sk-card')?.focus?.()); });
  }

  select(r: 'client' | 'creator') { this.roleSvc.setRole(r); }
  skip() { this.roleSvc.skip(); }
  close() { this.roleSvc.close(); }

  onCardKeydown(e: KeyboardEvent, r: 'client' | 'creator') {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); this.select(r); }
  }

  @HostListener('document:keydown', ['$event'])
  onDocKeydown(e: KeyboardEvent) {
    if (!this.isOpen()) return;
    if (e.key === 'Escape') { e.preventDefault(); this.close(); }
  }
}
