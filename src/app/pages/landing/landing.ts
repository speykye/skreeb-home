import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CommissionTier } from '../../components/commission-tier/commission-tier';
import { RateTier, FullBreakdown, DEFAULT_USD_MVP_TIERS } from '../../shared/fees/fee.utils';
import { RoleService } from '../../shared/role/role.service';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, CommissionTier],
  templateUrl: './landing.html',
  styleUrls: ['./landing.scss']
})
export class Landing {
  private readonly roleSvc = inject(RoleService);
  readonly year = new Date().getFullYear();
  tiers: RateTier[] = DEFAULT_USD_MVP_TIERS;
  capCents = 1000 * 100; // IMPORTANT: only Tier 4 has cap per tier config
  fee?: FullBreakdown;

  onFee(res: FullBreakdown) { this.fee = res; }

  scrollToHash(id: string) {
    const dom = document.getElementById(id);
    dom!.scrollIntoView({
      behavior: 'smooth',
      block: 'center'
    })
  }

  go() {
    this.roleSvc.enterOrAsk(
      ['/pricing'],
      {p_event_key: 'pricing', buttonId: 'pricing'}
    );
  }

  tieredCommission() {
    this.roleSvc.enterOrAsk(
      ['/pricing'],
      {p_event_key: 'pricing', buttonId: 'View docs'}
    );
  }

  readWhitepaper() {
    this.roleSvc.enterOrAsk(
      ['/whitepaper'],
      {p_event_key: 'whitepaper', buttonId: 'Read whitepaper'}
    );
  }

  terms() {
    this.roleSvc.enterOrAsk(
      ['/terms'],
      {p_event_key: 'terms', buttonId: 'Terms'}
    );
  }

  privacy() {
    this.roleSvc.enterOrAsk(
      ['/privacy'],
      {p_event_key: 'privacy', buttonId: 'Privacy'}
    );
  }

  about() {
    this.roleSvc.enterOrAsk(
      ['/about'],
      {p_event_key: 'about', buttonId: 'About'}
    );
  }

  contact() {
    this.roleSvc.enterOrAsk(
      ['/contact'],
      {p_event_key: 'contact', buttonId: 'Contact'}
    );
  }

  async ngOnInit() {
  }
}
