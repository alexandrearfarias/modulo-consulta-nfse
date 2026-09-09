import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, of, tap } from 'rxjs';
import { OAuthTokenResponse } from './models/oauth-token-response';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly http = inject(HttpClient);
    private accessToken: string | null = null;
    private expiration: number | null = null;

    obterToken(): Observable<OAuthTokenResponse> {
        if (this.accessToken && this.expiration && Date.now() < this.expiration) {
            return of({
                access_token: this.accessToken,
                token_type: 'Bearer',
                expires_in: Math.floor((this.expiration - Date.now()) / 1000)
            });
        }

        const credentials = btoa(`${environment.oauth.clientId}:${environment.oauth.clientSecret}`);

        const headers = new HttpHeaders({
            Authorization: `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded'
        });

        const body = new URLSearchParams({
            grant_type: 'client_credentials',
            scope: environment.oauth.scope
        }).toString();

        return this.http.post<OAuthTokenResponse>(environment.oauth.tokenUrl, body, { headers })
          .pipe(tap(response => {
            this.accessToken = response.access_token;
            this.expiration = Date.now() + (response.expires_in * 1000);
          })
        );
    }

    getToken(): string | null {
        if (!this.accessToken || !this.expiration || Date.now() >= this.expiration) {
            return null;
        }

        return this.accessToken;
    }

    getExpiration(): number | null {
        return this.expiration;
    }
}
