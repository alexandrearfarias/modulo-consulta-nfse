import { Nfse } from "./nfse";

export interface FiltrosNfse {
    status?: Nfse['status'],
    adnStatus?: Nfse['adn_status'],

    chaveAcesso?: string,
    externalId?: string,

    prestadorCpfCnpj?: string,
    tomadorCpfCnpj?: string,
    
    dataInicial?: string,
    dataFinal?: string
}
