import { Component, EventEmitter, Input, Output, computed, signal, effect } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import {
  RateTier, DEFAULT_USD_MVP_TIERS,
  toCents, fromCents, formatMoney,
  computeBreakdown, FullBreakdown, BaseMode
} from '../../shared/fees/fee.utils';

@Component({
  selector: 'app-commission-tier',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './commission-tier.html',
  styleUrl: './commission-tier.scss'
})
export class CommissionTier {
  // ====== Inputs ======
  @Input() title = 'Tiered commission 10% → 3% (Tier-4 cap $1,000 / order)';
  @Input() symbol = '$';
  @Input() decimals = 2;

  private _tiers = signal<RateTier[]>(DEFAULT_USD_MVP_TIERS);
  @Input() set tiers(val: RateTier[]) { if (val?.length) this._tiers.set(val); }
  get tiers() { return this._tiers(); }

  // NOTE: global cap disabled (0); only Tier 4 (3%) defines capCents: 100000
  private _capCents = signal<number>(0);
  @Input() set capCents(val: number) { this._capCents.set(val ?? 0); }
  get capCents() { return this._capCents(); }

  private _amountMajor = signal<number>(750); // order gross (UI input)
  @Input() set amount(val: number | null | undefined) { if (val != null) this._amountMajor.set(val); }
  get amount() { return this._amountMajor(); }

  // Pass-through & base mode
  @Input() baseMode: BaseMode = 'gross'; // safer default for standalone use
  @Input() storeBps = 0;
  @Input() storeFixedCents = 0;
  @Input() bankBps = 0;
  @Input() bankFixedCents = 0;

  // ====== Outputs ======
  @Output() computed = new EventEmitter<FullBreakdown>();

  // ====== Derived ======
  readonly amountCents = computed(() => toCents(this._amountMajor(), this.decimals));
  readonly breakdown = computed(() => computeBreakdown(
    this.amountCents(), this._tiers(), this._capCents(), {
      baseMode: this.baseMode,
      storeBps: this.storeBps,
      storeFixedCents: this.storeFixedCents,
      bankBps: this.bankBps,
      bankFixedCents: this.bankFixedCents,
    }
  ));

  constructor() {
    effect(() => this.computed.emit(this.breakdown()));
  }

  updateAmountFromInput(v: string) {
    const n = Number(v.replace(/[^0-9.]/g, ''));
    this._amountMajor.set(isFinite(n) ? n : 0);
  }

  rangeLabel(t: RateTier): string {
    const min = this.fmt(this.centsToMajor(t.min));
    if (t.max == null) return `${min}+`;
    const max = this.fmt(this.centsToMajor(t.max));
    return `${min} – ${max}`;
  }

  // Tier-4 cap (10% only)
  tier4CapCents() {
    const t = this._tiers().find(x => x.bps === 300 && typeof x.capCents === 'number');
    return t?.capCents ?? 0;
  }

  fmt(major: number) { return formatMoney(major, this.symbol, this.decimals); }
  centsToMajor(c: number) { return fromCents(c, this.decimals); }
}
