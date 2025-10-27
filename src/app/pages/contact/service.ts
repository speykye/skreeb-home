import { Injectable } from '@angular/core';
import { ApiClient } from '../../core/http/api-client.service';
import { Observable } from 'rxjs';
import { ContactRequestDTO } from '../../shared/dto/contact.dto';

@Injectable({ providedIn: 'root' })
export class ContactService {
    constructor(private api: ApiClient) { }

    submit(payload: ContactRequestDTO): Observable<any> {
        const body = {
            ...payload,
            metadata: {
                referrer: document.referrer || undefined,
                userAgent: navigator.userAgent
            }
        };
        return this.api.post<ContactRequestDTO>('/api/fn/contact', body);
    }
}