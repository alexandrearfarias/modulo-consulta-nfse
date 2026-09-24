import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        redirectTo: 'nfse',
        pathMatch: 'full'
    },
    {
        path: 'nfse',
        children: [
            {
                path: '',
                loadComponent: async () => {
                    return import('./features/nfse/pages/consulta/consulta').then(m => m.Consulta)
                }
            },
            {
                path: 'detalhes/:id',
                loadComponent: async () => {
                    return import('./features/nfse/pages/detalhes/detalhes').then(m => m.Detalhes)
                }
            }
        ]
    }
];
