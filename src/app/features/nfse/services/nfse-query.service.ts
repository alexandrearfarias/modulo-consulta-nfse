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
        // filtragem principal
        let resultado = await this.buscarDados(filtros);

        // filtragem secundaria
        resultado = resultado.filter(nfse => {
            if (filtros.status && filtros.status !== nfse.status) {
                return false;
            }
            if (filtros.adnStatus && filtros.adnStatus !== nfse.adn_status) {
                return false;
            }
            if (filtros.chaveAcesso && filtros.chaveAcesso !== nfse.chave_acesso) {
                return false;
            }
            if (filtros.externalId && filtros.externalId !== nfse.chave_acesso) {
                return false;
            }
            if (filtros.prestadorCpfCnpj && filtros.prestadorCpfCnpj !== nfse.prest_cpf_cnpj) {
                return false;
            }
            if (filtros.tomadorCpfCnpj && filtros.tomadorCpfCnpj !== nfse.toma_cpf_cnpj) {
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
}
