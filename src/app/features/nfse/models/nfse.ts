export interface Nfse {
  id: string;
  created_at: string;

  status: string;
  adn_status: string;

  last_error: NfseErro | null;

  external_id: string | null;
  chave_acesso: string | null;

  tp_amb: number;
  c_loc_emi: string;
  x_loc_emi: string;

  c_loc_prestacao: string;
  c_pais_prestacao: string;
  x_loc_prestacao: string;

  n_nfse: string;

  c_loc_incid: string;
  x_loc_incid: string;

  amb_ger: number;
  tp_emis: number;
  proc_emi: number;
  c_stat: number;

  dh_proc: string | null;

  n_dfse: string;
  tp_emit: number;

  emit_cpf_cnpj: string;
  emit_x_nome: string;

  v_liq: number;

  id_dps: string;

  dh_emi: string;

  serie: string;
  n_dps: string;

  prest_cpf_cnpj: string;
  prest_x_nome: string;

  toma_cpf_cnpj: string;
  toma_x_nome: string;

  interm_cpf_cnpj: string;
  interm_x_nome: string;

  c_trib_nac: string;
  c_trib_mun: string;
  c_nbs: string;

  v_serv: number;
}

export interface NfseErro {
  source: string;
  code: string;
  message: string;
  at: string;
}
