import { inject, Injectable } from "@angular/core";
import { NFSeDatabaseService } from "../../../core/database/nfse-database.service";
import { NFSeService } from "./nfse.service";
import { NfseListParams } from "../models/nfse-list-params";
import { ResultadoSincronizacaoPagina } from "../models/resultado-sinc-page";
import { ResultadoSincronizacao } from "../models/resultado-sinc";
import { firstValueFrom } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class NfseSyncService {
    private readonly database = inject(NFSeDatabaseService);
    private readonly nfseService = inject(NFSeService);

    async sincronizarPagina(pagina:number, tamanhoPagina: number): Promise<ResultadoSincronizacaoPagina> {
        const params: NfseListParams = {
            top: tamanhoPagina,
            skip: pagina * tamanhoPagina
        };

        const resposta = await firstValueFrom(this.nfseService.listar(params));

        let novas = 0;
        let atualizadas = 0;
        for(const nfse of resposta.data) {
            const existente = await this.database.buscar(nfse.id);
            if (existente) {
                atualizadas++;
            } else {
                novas++
            }

            await this.database.salvar(nfse);
        }

        return { 
            recebidas: resposta.data.length,
            novas: novas,
            atualizadas: atualizadas 
        };
    }

    async sincronizarTudo(tamanhoPagina = 100): Promise<ResultadoSincronizacao> {
        let pagina = 0;
        let recebidas = 0;
        let novas = 0;
        let atualizadas = 0;

        while (true) {
            const quantidade = await this.sincronizarPagina(pagina, tamanhoPagina);

            recebidas += quantidade.recebidas;
            novas += quantidade.novas;
            atualizadas += quantidade.atualizadas;
            if (quantidade.recebidas < tamanhoPagina || quantidade.novas === 0) {
                break;
            }
            pagina++;
        }

        await this.database.salvarMetadata('ultimaSincronizacao', new Date().toISOString())
        return {
            recebidas: recebidas,
            novas: novas,
            atualizadas: atualizadas
        };
    }
}
