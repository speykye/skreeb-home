import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { CommissionTier } from '../../components/commission-tier/commission-tier';
import { RecordEventService } from '../../core/services/record-event.service';
import { firstValueFrom } from 'rxjs';
import { RoleService } from '../../shared/role/role.service';

type Identity = 'client' | 'creator';

@Component({
  selector: 'app-pricing',
  standalone: true,
  imports: [CommonModule, CommissionTier],
  templateUrl: './pricing.html',
  styleUrls: ['./pricing.scss'],
})
export class Pricing {
  private readonly roleSvc = inject(RoleService);
  private api = inject(RecordEventService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  async ngOnInit() {
    // 1) 读取路由查询参数
    const qp = this.route.snapshot.queryParamMap;
    const p_event_key = (qp.get('p_event_key') ?? 'pricing').trim();
    const qpIdentity = qp.get('p_identity') as Identity | null;

    // 2) identity 回退：query -> localStorage -> 'client'
    const lsIdentity = (safeGetLocal('skreeb.role') as Identity | null);
    const p_identity: Identity = (qpIdentity === 'client' || qpIdentity === 'creator')
      ? qpIdentity
      : (lsIdentity === 'client' || lsIdentity === 'creator')
        ? lsIdentity
        : 'client';

    const buttonId = (qp.get('buttonId') ?? 'page-auto').trim();

    // 3) 规范化路径（去掉查询串）
    const p_path = this.router.url.split('?')[0] || location.pathname;

    // 4) 确保 sessionId
    const p_session_id = await this.api.ensureSessionId();

    // 5) 上报埋点（用 firstValueFrom 等待一次完成）
    await firstValueFrom(
      this.api.recordEvent({
        p_event_key,
        p_session_id,
        p_identity,
        p_path,
        p_meta: { buttonId },
        p_window_seconds: 30,
      })
    );
  }

  goWhitePaper() {
    this.roleSvc.enterOrAsk(
      ['/whitepaper'],
      {p_event_key: 'whitepaper', buttonId: 'Read the whitepaper'}
    )
  }

  goFullFeePolicy() {
    this.roleSvc.enterOrAsk(
      ['/legal-doc'],
      {p_event_key: 'legal-doc', buttonId: 'Full fee policy'}
    )
  }
}

/** 读取 localStorage 的小工具：非阻塞、容错 */
function safeGetLocal(key: string): string | null {
  try { return localStorage.getItem(key); } catch { return null; }
}
