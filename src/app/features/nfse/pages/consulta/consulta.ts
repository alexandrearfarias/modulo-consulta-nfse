import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FiltroConsulta } from '../../components/filtro-consulta/filtro-consulta';
import { FiltrosNfse } from '../../models/filtros-nfse';
import { Nfse } from '../../models/nfse';
import { MatTableModule } from '@angular/material/table';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DocumentPipe } from '../../../../shared/pipes/document.pipe';
import { NfseSyncService } from '../../services/nfse-sync.service';
import { MatAnchor } from '@angular/material/button';
import { NfseQueryService } from '../../services/nfse-query.service';

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
    DocumentPipe,
    MatAnchor
],
  selector: 'app-consulta',
  styleUrl: './consulta.scss',
  templateUrl: './consulta.html',
})
export class Consulta {
  // injeção de dependencias
  private readonly syncService = inject(NfseSyncService);
  private readonly queryService = inject(NfseQueryService);

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

  protected sincronizar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.syncService.sincronizarTudo()
    .then(quantidade => {
      console.log(`Sincronização concluida. ${quantidade} NFSe processadas.`);
    })
    .catch(err => {
      console.error('Erro na sincronização', err);
    })
    .finally(() => {
      this.carregando.set(false);
    });
  }

  protected executarConsulta(): void {
    const filtros = this.filtrosAtuais();
    if (!filtros) { return; }

    this.erro.set(null);
    this.nfse.set([]);
    this.carregando.set(true);

    this.queryService.consultar(filtros, this.paginaAtual(), this.tamanhoPagina())
    .then(resultado => {
      this.nfse.set(resultado.data);
      this.total.set(resultado.total);
    })
    .catch(err => {
      this.erro.set('Não foi possível consultar as NFS-e.');
      console.error('Erro ao consultar NFSe', err);
    })
    .finally(() => {
      this.carregando.set(false);
    });

    // const params: NfseListParams = {
    //   top: this.tamanhoPagina(),
    //   skip: this.paginaAtual() * this.tamanhoPagina(),

    //   status: filtros.status,
    //   adn_status: filtros.adnStatus,
    //   chave_acesso: filtros.chaveAcesso,
    //   external_id: filtros.externalId
    // };

    // this.service.listar(params)
    // .subscribe({
    //   next: (resposta) => {
    //     this.nfse.set(resposta.data);
    //     this.total.set(resposta['@count']?? resposta.data.length);
    //     this.carregando.set(false);
    //   },
    //   error: err => {
    //     this.carregando.set(false);
    //     this.erro.set("Não foi possível consultar as NFSe. Tente novamente.");
    //     console.error('Erro ao consultar', err);
    //   }
    // });
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
