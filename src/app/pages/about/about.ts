import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

type ChangeItem = { text: string, href?: string };

@Component({
  selector: 'app-about',
  imports: [RouterLink],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About {
  problems = [
    { title: 'Newcomer discovery & negotiation', desc: 'Clear briefs and portfolio presentation reduce back-and-forth.' },
    { title: 'Messy process, costly disputes', desc: 'Milestones with audit-ready history keep work traceable.' },
    { title: 'Opaque, high platform cuts', desc: 'Tiered fees with caps, fully documented and versioned.' },
    { title: 'AI replacement worries', desc: 'AI assists; humans create and arbitrate.' },
  ];

  mvp = [
    'Role cards (Client / Creator) & reusable Brief templates',
    'In-order messaging with milestone approvals + delay/change/price requests',
    'Lightweight arbitration (AI summary → human decision)',
    'Safety & segmentation aligned with target markets',
    'Passkey-first login; minimal data',
  ];

  roadmap = [
    'MVP: roles, briefs, order + milestones, light arbitration, fee docs',
    'Phase 2: Chronicles, Creator Fund, Pro for verified companies',
  ];

  recentChanges: ChangeItem[] = [
    { text: 'US-first market focus; bilingual support for CN–US users' },
    { text: 'Passkey-first authentication; email fallback' },
    { text: 'Fee Schedule (tiers + caps) published and versioned', href: '/whitepaper' },
    { text: 'First-run role selection modal (Client / Creator)' },
    { text: 'One-page Whitepaper live; Company nav refined', href: '/whitepaper' },
  ];
}
