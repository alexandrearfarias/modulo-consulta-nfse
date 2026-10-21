import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import  localePtBr  from '@angular/common/locales/pt'
import { registerLocaleData } from '@angular/common';
import { provideCharts, withDefaultRegisterables } from 'ng2-charts';

registerLocaleData(localePtBr, 'pt-BR')

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    provideCharts(withDefaultRegisterables()),
  ]
};
