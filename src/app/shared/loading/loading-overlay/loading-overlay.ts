import { Component, Input, inject } from '@angular/core';
import { LoadingService } from '../loading.service';

@Component({
  selector: 'app-loading-overlay',
  imports: [],
  templateUrl: './loading-overlay.html',
  styleUrl: './loading-overlay.scss',
})
export class LoadingOverlay {
  private loading = inject(LoadingService);
  active = this.loading.active;
  @Input() src = '/assets/ui/loading.gif';
  @Input() alt = 'Loading…';
}
