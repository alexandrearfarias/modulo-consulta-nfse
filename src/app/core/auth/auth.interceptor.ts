import { HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { switchMap } from "rxjs";
import { AuthService } from "./auth.service";
import { environment } from "../../../environments/environment";

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    const auth = inject(AuthService);

    if (req.url === environment.oauth.tokenUrl) {
        return next(req);
    }

    const token = auth.getToken();

    if (!req.url.startsWith(environment.api.baseUrl)) {
        return next(req);
    }

    if (token) {
        return next(req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        }));
    }

    return auth.obterToken().pipe(
        switchMap(response => next(req.clone({
            setHeaders: {
                Authorization: `Bearer ${response.access_token}`
            }
        })))
    );
};
