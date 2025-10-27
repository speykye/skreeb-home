// -------------------------------------------
// src/app/shared/fees/fee.utils.ts
// Order-level tiering; only Tier-4 (10%) has $1,000 cap.
// Platform Base = order gross - pass-through fees - taxes (when baseMode='net').
// -------------------------------------------

export interface RateTier {
  /** lower bound inclusive, in minor units (cents) */
  min: number;
  /** upper bound inclusive, in minor units (cents); omit = Infinity */
  max?: number;
  /** rate in basis points (e.g. 300 = 3%) */
  bps: number;
  /** optional per-tier cap in cents; falls back to global cap if omitted */
  capCents?: number;
}

/**
 * Fee computation on a given base amount (typically Platform Base).
 * amountCents here == the base used to compute platform fee.
 */
export interface FeeComputation {
  amountCents: number;        // platform base in cents
  feeCents: number;           // platform fee in cents (after cap)
  netCents: number;           // amountCents - feeCents
  appliedTierIndex: number;   // which tier matched
  appliedBps: number;         // rate used
  capped: boolean;            // whether cap applied
  capCents: number;           // cap used (Infinity => no cap)
  effectiveRatePct: number;   // (feeCents / amountCents) * 100
}

export type BaseMode = 'gross' | 'net';

export interface CostOptions {
  baseMode?: BaseMode;       // 'net' => Platform Base excludes pass-through & taxes
  storeBps?: number;         // e.g., 1500 for 15% app-store fee
  storeFixedCents?: number;  // fixed charge added by store/processor
  bankBps?: number;          // payout/settlement percentage (if any)
  bankFixedCents?: number;   // payout fixed cost
}

export interface FullBreakdown extends FeeComputation {
  /** Order gross (before pass-through & taxes) */
  orderGrossCents: number;
  /** Platform Base in cents (equals FeeComputation.amountCents) */
  platformBaseCents: number;
  /** Pass-throughs (not capped, not commissionable) */
  storeFeeCents: number;
  bankFeeCents: number;
  /** Totals */
  totalFeesCents: number;       // store + bank + platform
  creatorReceivesCents: number; // orderGrossCents - totalFeesCents
  baseMode: BaseMode;
}

// ---- Default tiers (USD) — thresholds align with §18 ----
export const DEFAULT_USD_MVP_TIERS: RateTier[] = [
  { min: 0,       max: 50_000,  bps: 300 },                 // $0.00 – $500.00 → 3%
  { min: 50_001,  max: 300_000, bps: 500 },                 // $500.01 – $3,000.00 → 5%
  { min: 300_001, max: 500_000, bps: 700 },                 // $3,000.01 – $5,000.00 → 7%
  { min: 500_001,               bps: 1000, capCents: 100_000 }, // $5,000.01+ → 10%, Tier-4 Cap $1,000/order
];

/** Global cap disabled; use per-tier cap (only Tier 4 has one) */
export const DEFAULT_USD_MVP_CAP_CENTS = 0;

export function pickTier(amountCents: number, tiers: RateTier[]): { tier: RateTier; index: number } {
  const t = tiers.find((x) => amountCents >= x.min && (x.max == null || amountCents <= x.max));
  const idx = t ? tiers.indexOf(t) : -1;
  return { tier: t ?? tiers[tiers.length - 1], index: idx >= 0 ? idx : tiers.length - 1 };
}

export function calcFee(amountCents: number, tiers: RateTier[], capCents: number): FeeComputation {
  if (amountCents <= 0) {
    return {
      amountCents: 0,
      feeCents: 0,
      netCents: 0,
      appliedTierIndex: -1,
      appliedBps: 0,
      capped: false,
      capCents: 0,
      effectiveRatePct: 0,
    };
  }
  const { tier, index } = pickTier(amountCents, tiers);
  const rawFee = Math.round((amountCents * tier.bps) / 10_000); // round to cent
  const effectiveGlobalCap = capCents && capCents > 0 ? capCents : Number.POSITIVE_INFINITY;
  const applicableCap = (typeof tier.capCents === 'number') ? tier.capCents : effectiveGlobalCap;

  const feeCents = Math.min(rawFee, applicableCap);
  const netCents = amountCents - feeCents;
  const effectiveRatePct = amountCents > 0 ? (feeCents / amountCents) * 100 : 0;

  return {
    amountCents,
    feeCents,
    netCents,
    appliedTierIndex: index,
    appliedBps: tier.bps,
    capped: rawFee > applicableCap,
    capCents: applicableCap,
    effectiveRatePct,
  };
}

export const DEFAULT_COST_OPTS: Required<CostOptions> = {
  baseMode: 'gross',
  storeBps: 0,
  storeFixedCents: 0,
  bankBps: 0,
  bankFixedCents: 0,
};

/**
 * Computes full order breakdown:
 * - Pass-throughs (store/bank)
 * - Platform Base per baseMode
 * - Platform fee via tiers (+ Tier-4 cap)
 * - Creator receives
 */
export function computeBreakdown(
  orderGrossCents: number,
  tiers: RateTier[],
  capCents: number,
  opts?: CostOptions
): FullBreakdown {
  const o = { ...DEFAULT_COST_OPTS, ...(opts ?? {}) };
  const pct = (x: number, bps: number) => Math.round((x * bps) / 10_000);

  const storeFeeCents = pct(orderGrossCents, o.storeBps) + o.storeFixedCents;
  const bankFeeCents  = pct(orderGrossCents, o.bankBps)  + o.bankFixedCents;

  const platformBaseCents = o.baseMode === 'net'
    ? Math.max(0, orderGrossCents - storeFeeCents - bankFeeCents)
    : orderGrossCents;

  const fee = calcFee(platformBaseCents, tiers, capCents);

  const totalFeesCents = storeFeeCents + bankFeeCents + fee.feeCents;
  const creatorReceivesCents = Math.max(0, orderGrossCents - totalFeesCents);

  // Ensure FeeComputation.amountCents 表示“平台计费基数”
  return {
    ...fee,
    amountCents: platformBaseCents, // keep semantics: base used for platform fee
    orderGrossCents,
    platformBaseCents,
    storeFeeCents,
    bankFeeCents,
    totalFeesCents,
    creatorReceivesCents,
    baseMode: o.baseMode,
  };
}

// Helpers
export function toCents(major: number, decimals = 2): number {
  const f = Math.pow(10, decimals);
  return Math.round((major || 0) * f);
}
export function fromCents(cents: number, decimals = 2): number {
  const f = Math.pow(10, decimals);
  return (cents || 0) / f;
}
export function formatMoney(major: number, symbol = '$', decimals = 2): string {
  return `${symbol}${major.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}
