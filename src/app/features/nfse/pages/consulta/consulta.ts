import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FiltroConsulta } from '../../components/filtro-consulta/filtro-consulta';
import { FiltrosNfse } from '../../models/filtros-nfse';
import { NFSeService } from '../../services/nfse.sevice';
import { AuthService } from '../../../../core/auth/auth.service';
import { Nfse } from '../../models/nfse';
import { MatTableModule } from '@angular/material/table';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { NfseListParams } from '../../models/nfse-list-params';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DocumentPipe } from '../../../../shared/pipes/document.pipe';
import { NFSeDatabaseService } from '../../../../core/database/nfse-database.service';

@Component({
  imports: [
    MatCardModule, 
    FiltroConsulta, 
    MatTableModule, 
    CurrencyPipe, 
    DatePipe, 
    MatPaginatorModule, 
    MatProgressSpinnerModule, 
    MatIconModule, 
    MatChipsModule, 
    DocumentPipe
  ],
  selector: 'app-consulta',
  styleUrl: './consulta.scss',
  templateUrl: './consulta.html',
})
export class Consulta {
  // injeção de dependencias
  private readonly service = inject(NFSeService);
  private readonly auth = inject(AuthService);
  private readonly database = inject(NFSeDatabaseService)

  // parametros e objetos
  protected readonly nfse = signal<Nfse[]>([]);
  protected readonly carregando = signal(false);
  protected readonly total = signal(0);
  protected readonly filtrosAtuais = signal<FiltrosNfse|null>(null);
  protected readonly erro = signal<string | null>(null);

  // paginação
  protected readonly paginaAtual = signal(0);
  protected readonly tamanhoPagina = signal(10);
  
  protected readonly colunas = [
    'numero',
    'emissao',
    'prestador',
    'cpf_cnpj_prestador',
    'tomador',
    'cpf_cnpj_tomador',
    'valor',
    'status'
  ];

  // mapping de valores
  protected getStatusLabel(status: Nfse['status']): string {
    const labels: Record<Nfse['status'], string> = {
      processing: 'Em processamento',
      issued: 'Emitida',
      rejected: 'Rejeitada',
      canceled: 'Cancelada',
      substituted: 'Substituída',
      error: 'Erro'
    };
    return labels[status];
  }

  protected getAdnStatusLabel(status: Nfse['adn_status']): string {
    const labels: Record<Nfse['adn_status'], string> = {
      peding: 'Pendente',
      shared: 'Compartilhada',
      rejected: 'Rejeitada',
      error: 'Erro'
    };
    return labels[status];
  }

  constructor() {
    this.database.abrir()
    .then(() => {
      console.log('IndexedDB aberto com sucesso!');
    })
    .catch((err) => {
      console.error('Erro ao abri o  IndexedDB', err);
    });

    this.database.salvar(this.notaTeste)
    .then(()=> { console.log('Nfse foi salva com sucesso!') })
    .catch((err) => { console.error('Erro ao tentar adicionar a NFSe', err) });

    this.database.buscar(this.notaTeste.id)
    .then((nfse) => { console.log('Nota fiscal encontrada', nfse) })
    .catch((err) => { console.error('Erro ao buscar pela nota', err) });

    this.database.listar()
    .then((nfse) => { console.log('Lista de notas fiscais', nfse) })
    .catch((err) => { console.error('Erro ao buscar pela nota', err) });

    this.database.buscarPorStatus('issued')
    .then((nfses) => { console.log('Nfse emitidas', nfses) })
    .catch((err) => { console.error('Erro ao buscar por status', err) });
    
    this.database.buscarPorStatus('canceled')
    .then((nfses) => { console.log('Nfse canceladas', nfses) })
    .catch((err) => { console.error('Erro ao buscar por status', err) });
  }

   private readonly notaTeste: Nfse = {
    id: 'teste-001',
    created_at: '2026-09-10T13:00:00Z',
    status: 'issued',
    adn_status: 'shared',
    external_id: 'teste-001',
    chave_acesso: '12345678901234567890123456789012345678901234567890',
    tp_amb: 2,
    c_loc_emi: '2211001',
    x_loc_emi: 'Teresina',
    c_loc_prestacao: '2211001',
    c_pais_prestacao: '1058',
    x_loc_prestacao: 'Teresina',
    n_nfse: '123',
    c_loc_incid: '2211001',
    x_loc_incid: 'Teresina',
    amb_ger: 2,
    tp_emis: 1,
    proc_emi: 1,
    c_stat: 100,
    dh_proc: '2026-09-10T13:00:00Z',
    n_dfse: '123',
    tp_emit: 1,
    emit_cpf_cnpj: '12345678000199',
    emit_x_nome: 'Empresa Teste',
    v_liq: 1000,
    id_dps: 'dps-001',
    dh_emi: '2026-09-10T12:50:00Z',
    serie: '1',
    n_dps: '123',
    prest_cpf_cnpj: '12345678000199',
    prest_x_nome: 'Empresa Teste',
    toma_cpf_cnpj: '98765432000188',
    toma_x_nome: 'Cliente Teste',
    interm_cpf_cnpj: '',
    interm_x_nome: '',
    c_trib_nac: '010101',
    c_trib_mun: '123',
    c_nbs: '123456789',
    v_serv: 1000,
    last_error: null
  };

  protected executarConsulta(): void {
    const filtros = this.filtrosAtuais();
    if (!filtros) { return; }

    this.erro.set(null);
    this.nfse.set([]);
    this.carregando.set(true);

    const params: NfseListParams = {
      top: this.tamanhoPagina(),
      skip: this.paginaAtual() * this.tamanhoPagina(),

      status: filtros.status,
      adn_status: filtros.adnStatus,
      chave_acesso: filtros.chaveAcesso,
      external_id: filtros.externalId
    };

    this.service.listar(params)
    .subscribe({
      next: (resposta) => {
        this.nfse.set(resposta.data);
        this.total.set(resposta['@count']?? resposta.data.length);
        this.carregando.set(false);
      },
      error: err => {
        this.carregando.set(false);
        this.erro.set("Não foi possível consultar as NFSe. Tente novamente.");
        console.error('Erro ao consultar', err);
      }
    });
  }

  protected consultar(filtros: FiltrosNfse | null): void{
    this.filtrosAtuais.set(filtros);
    this.paginaAtual.set(0);

    this.executarConsulta();
  }

  protected mudarPagina(event: PageEvent): void {
    this.paginaAtual.set(event.pageIndex);
    this.tamanhoPagina.set(event.pageSize);

    this.executarConsulta();
  }
}
