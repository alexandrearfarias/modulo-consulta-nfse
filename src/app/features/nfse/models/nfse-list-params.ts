export interface NfseListParams {
    top: number;
    skip: number;

    status?: string;
    adn_status?: string;
    chave_acesso?: string;
    external_id?: string;
}
