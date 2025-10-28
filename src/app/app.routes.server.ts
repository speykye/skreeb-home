import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Client
  },
  {
    path: 'landing',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'whitepaper',
    renderMode: RenderMode.Server
  },
  {
    path: 'terms',
    renderMode: RenderMode.Server
  },
  {
    path: 'privacy',
    renderMode: RenderMode.Server
  },
  {
    path: 'pricing',
    renderMode: RenderMode.Server
  },
  {
    path: 'legal-doc',
    renderMode: RenderMode.Server
  },
  {
    path: 'contact',
    renderMode: RenderMode.Server
  },
  {
    path: 'about',
    renderMode: RenderMode.Server
  }
];
