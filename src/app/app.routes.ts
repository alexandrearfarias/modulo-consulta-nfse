import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'nfse',
        pathMatch: 'full'
    },
    {
        path: 'nfse',
        loadComponent: async () => {
            return import('./features/nfse/pages/consulta/consulta').then(m => m.Consulta)
        }
    }
];
