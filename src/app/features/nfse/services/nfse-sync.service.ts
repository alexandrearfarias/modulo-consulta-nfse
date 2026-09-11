import { inject, Injectable } from "@angular/core";
import { NFSeDatabaseService } from "../../../core/database/nfse-database.service";
import { NFSeService } from "./nfse.service";
import { NfseListParams } from "../models/nfse-list-params";
import { firstValueFrom } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class NfseSyncService {
    private readonly database = inject(NFSeDatabaseService);
    private readonly nfseService = inject(NFSeService);

    async sincronizarPagina(pagina:number, tamanhoPagina: number): Promise<number> {
        const params: NfseListParams = {
            top: tamanhoPagina,
            skip: pagina * tamanhoPagina
        };

        const resposta = await firstValueFrom(this.nfseService.listar(params));

        for(const nfse of resposta.data) {
            await this.database.salvar(nfse);
        }

        return resposta.data.length;
    }

    async sincronizarTudo(tamanhoPagina = 100): Promise<number> {
        let pagina = 0;
        let totalSalvo = 0;

        while (true) {
            const quantidade = await this.sincronizarPagina(pagina, tamanhoPagina);

            totalSalvo += quantidade;
            if (quantidade < tamanhoPagina) {
                break;
            }
            pagina++;
        }

        return totalSalvo;
    }
}
