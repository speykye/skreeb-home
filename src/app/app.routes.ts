import { Routes } from '@angular/router';

export const routes: Routes = [{
    path: '',
    redirectTo: 'landing',
    pathMatch: 'full'
}, {
    path: 'landing',
    loadComponent: () => import('./pages/landing/landing').then(m => m.Landing)
}, {
    path: 'whitepaper',
    loadComponent: () => import('./docs/whitepaper/whitepaper').then(m => m.Whitepaper)
}, {
    path: 'terms',
    loadComponent: () => import('./docs/terms/terms').then(m => m.Terms)
}, {
    path: 'privacy',
    loadComponent: () => import('./docs/privacy/privacy').then(m => m.Privacy)
}, {
    path: 'pricing',
    loadComponent: () => import('./pages/pricing/pricing').then(m => m.Pricing)
}, {
    path: 'legal-doc',
    loadComponent: () => import('./pages/legal-doc/legal-doc').then(m => m.LegalDoc)
}, {
    path: 'about',
    loadComponent: () => import('./pages/about/about').then(m => m.About)
}, {
    path: 'contact',
    loadComponent: () => import('./pages/contact/contact').then(m => m.Contact)
}];
