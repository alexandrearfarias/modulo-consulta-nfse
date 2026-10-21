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

export interface NfseDashboardStatus {
    status: string;
    quantidade: number;
}

export interface NfseDashboardMensal {
    mes: string;
    quantidade: number;
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

    async obterDistribuicaoPorStatus(): Promise<NfseDashboardStatus[]> {
        const resumo = await this.obterResumo();

        return [
            { status: "Emitidas", quantidade: resumo.emitidas },
            { status: "Em Processamento", quantidade: resumo.processamento },
            { status: "Rejeitadas", quantidade: resumo.rejeitadas },
            { status: "Canceladas", quantidade: resumo.canceladas },
            { status: "Substituídas", quantidade: resumo.substituidas },
            { status: "Erros", quantidade: resumo.erros },
        ];
    }

    async obterEvolucaoMensal(): Promise<NfseDashboardMensal[]> {
        const nfses = await this.databese.listar();
        const quantidadePorMes = new Map<string, number>();

        for(const nfse of nfses) {
            if(!nfse.dh_emi) {
                continue;
            }

            const data = new Date(nfse.dh_emi);
            if (Number.isNaN(data.getTime())) {
                continue;
            }

            const chaveMes = [
                data.getFullYear(),
                String(data.getMonth() + 1).padStart(2, '0')
            ].join('-');

            quantidadePorMes.set(chaveMes, (quantidadePorMes.get(chaveMes) ?? 0) + 1);
        }

        return Array.from(quantidadePorMes.entries())
         .sort(([mesA], [mesB]) => mesA.localeCompare(mesB))
         .map(([mes, quantidade]) => ({ mes, quantidade }));
    }
}
