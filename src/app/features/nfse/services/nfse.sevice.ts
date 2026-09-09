import { inject, Injectable } from "@angular/core";
import { ApiClient } from "../../../core/api/api-client";
import { Observable } from "rxjs";
import { NfseResponse } from "../models/nfse-response";
import { NfseListParams } from "../models/nfse-list-params";
import { HttpParams, HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})
export class NFSeService {
    private readonly apiClient = inject(ApiClient);
    private readonly endpoint = 'https://api.simplesinformatica.net/nfse';

    listar(params: NfseListParams): Observable<NfseResponse> {
        let httpParam = new HttpParams()
        .set('$top',    params.top)
        .set('$skip',   params.skip)
        .set('$inlinecount', true);

        if (params.adn_status) {
            httpParam = httpParam.set('adn_status', params.adn_status);
        }
        if (params.chave_acesso) {
            httpParam = httpParam.set('chave_acesso', params.chave_acesso);
        }
        if (params.external_id) {
            httpParam = httpParam.set('external_id', params.external_id);
        }
        if (params.status) {
            httpParam = httpParam.set('status', params.status);
        }

        return this.apiClient.get(this.endpoint, httpParam);
    }
}