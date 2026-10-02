import { inject, Injectable } from "@angular/core";
import { NFSeDatabaseService } from "../../../core/database/nfse-database.service";
import { Nfse } from "../models/nfse";

export interface NfseDashboardResumo {
    total: number;
    emitidas: number;
    processamento: number;
    rejeitadas: number;
    canceladas: number;
    substituidas: number;
    erros: number;
    valorTotal: number;
}

@Injectable({
    providedIn: 'root'
})
export class NfseDashboardService {
    private readonly databese = inject(NFSeDatabaseService);

    async obterTotal(): Promise<number> {
        const nfses = await this.databese.listar();
        return nfses.length;
    }

    async obterQuantidadePorStatus(status: Nfse['status']): Promise<number> {
        const nfses = await this.databese.buscarPorStatus(status);
        return nfses.length;
    }

    async obterResumo(): Promise<NfseDashboardResumo> {
        const [total, emitidas, processamento, rejeitadas, canceladas, substituidas, erros] = await Promise.all([
            this.obterTotal(),
            this.obterQuantidadePorStatus('issued'),
            this.obterQuantidadePorStatus('processing'),
            this.obterQuantidadePorStatus('rejected'),
            this.obterQuantidadePorStatus('canceled'),
            this.obterQuantidadePorStatus('substituted'),
            this.obterQuantidadePorStatus('error')
        ]);

        return { total,emitidas,processamento, rejeitadas, canceladas, substituidas, erros, valorTotal: await this.obterValorTotal() };
    }
    async obterValorTotal(): Promise<number> {
        const nfses = await this.databese.listar();

        return nfses.reduce((total, nfse) => total + (nfse.v_serv), 0);
    }
}
