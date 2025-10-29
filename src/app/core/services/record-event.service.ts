import { inject, Injectable } from '@angular/core';
import { ApiClient } from '../http/api-client.service';
import { Observable } from 'rxjs';
import { UniversalStorage } from '../universal-storage.service';

export type Identity = 'client' | 'creator';

export interface RecordEventBody {
    p_event_key: string;
    p_session_id?: string | null;
    p_path?: string | null;
    p_site?: string | null;
    p_referrer?: string | null;
    p_ua?: string | null;
    p_country?: string | null;
    p_accept_lang?: string | null;
    p_tz?: string | null;
    p_user_id?: string | null;
    p_identity?: Identity | null;
    p_meta?: any;
    p_window_seconds?: number | null;
    p_is_bot?: boolean | null;
    p_ip?: string | null
}

@Injectable({ providedIn: 'root' })
export class RecordEventService {
    private storage = inject(UniversalStorage);
    
    constructor(private api: ApiClient) { }

    recordEvent(payload: RecordEventBody): Observable<number> {
        return this.api.post<number>('/api/fn/record-event', payload);
    }

    ensureSessionId(key = 'skreeb_session_id'): string {
        let sid = this.storage.getItem(key);
        if (!sid) {
            sid = (crypto as any).randomUUID ? crypto.randomUUID() : this.uuidv4();
            this.storage.setItem(key, sid);
        }
        return sid;
    }

    private uuidv4(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
        });
    }
}