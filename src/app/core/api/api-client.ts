import { HttpClient, HttpParams } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class ApiClient {
    private readonly http = inject(HttpClient);

    get<T>( url: string, params?: Record<string, string | number | boolean>| HttpParams): Observable<T> {
        let httpParams: HttpParams;

        if (params instanceof HttpParams) {
            httpParams = params;
        } else {
            httpParams = new HttpParams();
            if (params) {
                Object.entries(params).forEach(([key, value]) => {
                    httpParams = httpParams.set(key, String(value));
                });
            }
        }

        return this.http.get<T>(url, { params: httpParams });
    }
}
