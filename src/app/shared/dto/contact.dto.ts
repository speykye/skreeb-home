export type ContactRole =
  | 'Client'
  | 'Creator'
  | 'Both'
  | 'Other';

export type ContactTopic =
  | 'Support'
  | 'Safety / Report'
  | 'Partnerships'
  | 'Press'
  | 'Legal'
  | 'Other';

export interface ContactRequestDTO {
  email: string;
  role: ContactRole;
  topic: ContactTopic;
  message: string;
  agree: boolean;
  // 可选：前端自动携带
  metadata?: {
    referrer?: string;
    userAgent?: string;
  };
  // 可选：Cloudflare Turnstile Token（若启用人机校验）
  cfTurnstileToken?: string;
}

export interface ContactResponseDTO {
  id: string;
  status: 'ok';
}
