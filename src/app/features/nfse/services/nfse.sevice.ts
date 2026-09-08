import { inject, Injectable } from "@angular/core";
import { ApiClient } from "../../../core/api/api-client";
import { Observable } from "rxjs";
import { NfseResponse } from "../models/nfse-response";

@Injectable({
    providedIn: 'root'
})
export class NFSeService {
    private readonly apiClient = inject(ApiClient);
    private readonly endpoint = 'https://api.simplesinformatica.net/nfse';

    listar(top = 10, skip= 0): Observable<NfseResponse> {
        return this.apiClient.get(this.endpoint, {
            '$top': top,
            '$skip': skip,
            '$inlinecount': true
        });
    }
}