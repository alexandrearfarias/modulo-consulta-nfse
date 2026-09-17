import { Component, inject, OnInit, signal } from '@angular/core';
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
import { NFSeDatabaseService } from '../../../../core/database/nfse-database.service';
import { MatSnackBar } from '@angular/material/snack-bar';

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
export class Consulta implements OnInit {
  // injeção de dependencias
  private readonly syncService = inject(NfseSyncService);
  private readonly queryService = inject(NfseQueryService);
  private readonly databaseService = inject(NFSeDatabaseService);
  private readonly snackBar = inject(MatSnackBar);

  // parametros e objetos
  protected readonly nfse = signal<Nfse[]>([]);
  protected readonly sincronizando = signal(false);
  protected readonly carregando = signal(false);
  protected readonly total = signal(0);
  protected readonly filtrosAtuais = signal<FiltrosNfse|null>(null);
  protected readonly erro = signal<string | null>(null);
  protected readonly ultimaSync = signal<string | null>(null);

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

  ngOnInit(): void {
    this.carregaUltimaSync();
  }

  // funções auxiliares
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

  // ações da tabela 
  protected async sincronizar(): Promise<void> {
    if ( this.sincronizando()) return;

    this.sincronizando.set(true);
    this.erro.set(null);

    try {
      const resultado = await this.syncService.sincronizarTudo();
      await this.carregaUltimaSync();
      await this.executarConsulta();

      this.snackBar.open(
        `${resultado.novas} novas e ${resultado.atualizadas} atualizadas`, 
        'Fechar', 
        { duration: 4000, verticalPosition: 'top' }
      );
    } catch (error) {
      console.error('Erro na sincronização', error);
    } finally {
      this.sincronizando.set(false);
    }
  }

  protected async executarConsulta(): Promise<void> {
    if ( this.carregando()) return;

    const filtros = this.filtrosAtuais();
    if (!filtros) { return; }

    this.erro.set(null);
    this.nfse.set([]);
    this.carregando.set(true);

    try {
      const resultado = await this.queryService.consultar(filtros, this.paginaAtual(), this.tamanhoPagina());
      this.nfse.set(resultado.data);
      this.total.set(resultado.total);
    } catch (error) {
      this.erro.set('Não foi possível consultar as NFSe');
      console.error('Erro ao consultar NFSe', error);
    } finally {
      this.carregando.set(false);
    }
  }

  protected consultar(filtros: FiltrosNfse | null): void{
    if ( this.carregando()) return;
    this.filtrosAtuais.set(filtros);
    this.paginaAtual.set(0);

    this.executarConsulta();
  }

  protected mudarPagina(event: PageEvent): void {
    if ( this.carregando()) return;
    this.paginaAtual.set(event.pageIndex);
    this.tamanhoPagina.set(event.pageSize);

    this.executarConsulta();
  }

  protected async carregaUltimaSync(): Promise<void> {
    const valor = await this.databaseService.buscaMetadata('ultimaSincronizacao');

    this.ultimaSync.set(valor ?? null);
  }
}
