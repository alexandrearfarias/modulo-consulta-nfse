import { inject, Injectable } from "@angular/core";
import { NFSeDatabaseService } from "../../../core/database/nfse-database.service";
import { Nfse } from "../models/nfse";
import { FiltrosNfse } from "../models/filtros-nfse";
import { ResultadoConsultaNfse } from "../models/resultado-consulta-nfse";

@Injectable({
    providedIn: 'root'
})
export class NfseQueryService {
    private readonly database = inject(NFSeDatabaseService);

    async consultar(filtros: FiltrosNfse, pagina = 0, tamanhoPagina = 10): Promise<ResultadoConsultaNfse> {
        const filtrosNormalizados: FiltrosNfse = {
            ...filtros,
            chaveAcesso: filtros.chaveAcesso?.trim(),
            externalId: filtros.externalId?.trim(),
            prestadorCpfCnpj: filtros.prestadorCpfCnpj ? this.formatarCpfCnpj(filtros.prestadorCpfCnpj) : undefined,
            tomadorCpfCnpj: filtros.tomadorCpfCnpj ? this.formatarCpfCnpj(filtros.tomadorCpfCnpj) : undefined
        }; 
        // filtragem principal
        let resultado = await this.buscarDados(filtrosNormalizados);

        // filtragem secundaria
        resultado = resultado.filter(nfse => {
            if (filtrosNormalizados.adnStatus && filtrosNormalizados.adnStatus !== nfse.adn_status) {
                return false;
            }
            if (filtrosNormalizados.chaveAcesso && filtrosNormalizados.chaveAcesso !== nfse.chave_acesso) {
                return false;
            }
            if (filtrosNormalizados.externalId && filtrosNormalizados.externalId !== nfse.chave_acesso) {
                return false;
            }
            if (filtrosNormalizados.prestadorCpfCnpj && filtrosNormalizados.prestadorCpfCnpj !== nfse.emit_cpf_cnpj) {
                return false;
            }
            if (filtrosNormalizados.tomadorCpfCnpj && filtrosNormalizados.tomadorCpfCnpj !== nfse.toma_cpf_cnpj) {
                return false;
            }
            
            return true;
        });

        resultado.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // paginação
        const total = resultado.length;
        const inicio = pagina * tamanhoPagina;
        const fim = inicio + tamanhoPagina;
        const data = resultado.slice(inicio, fim);

        return { data, total };
    }

    private buscarDados(filtros: FiltrosNfse): Promise<Nfse[]> {
        if (filtros.dataInicial || filtros.dataFinal) {
            return this.database.buscarPorPeriodo(filtros.dataInicial, filtros.dataFinal);
        }
        if (filtros.status) {
            return this.database.buscarPorStatus(filtros.status);
        }
        return this.database.listar();
    }

    private formatarCpfCnpj(value: string | null): string | undefined {
        if (!value) { return undefined; }
        return value.replace(/[^0-9a-zA-Z]/g, '');
    }
}
