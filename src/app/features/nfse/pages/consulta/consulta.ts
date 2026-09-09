import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FiltroConsulta } from '../../components/filtro-consulta/filtro-consulta';
import { FiltrosNfse } from '../../models/filtros-nfse';
import { NFSeService } from '../../services/nfse.sevice';
import { AuthService } from '../../../../core/auth/auth.service';
import { switchMap } from 'rxjs';
import { Nfse } from '../../models/nfse';
import { MatTableModule } from '@angular/material/table';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { NfseListParams } from '../../models/nfse-list-params';

@Component({
  imports: [MatCardModule, FiltroConsulta, MatTableModule, CurrencyPipe, DatePipe, MatPaginatorModule],
  selector: 'app-consulta',
  styleUrl: './consulta.scss',
  templateUrl: './consulta.html',
})
export class Consulta {
  // injeção de dependencias
  private readonly service = inject(NFSeService);
  private readonly auth = inject(AuthService);

  // parametros e objetos
  protected readonly nfse = signal<Nfse[]>([]);
  protected readonly carregando = signal(false);
  protected readonly total = signal(0);
  protected readonly filtrosAtuais = signal<FiltrosNfse|null>(null);

  // paginação
  protected readonly paginaAtual = signal(0);
  protected readonly tamanhoPagina = signal(10);
  
  protected readonly colunas = [
    'numero',
    'emissao',
    'prestador',
    'tomador',
    'valor',
    'status'
  ];

  protected executarConsulta(): void {
    const filtros = this.filtrosAtuais();
    if (!filtros) { return; }

    this.carregando.set(true);

    const params: NfseListParams = {
      top: this.tamanhoPagina(),
      skip: this.paginaAtual() * this.tamanhoPagina(),

      status: filtros.status,
      adn_status: filtros.adnStatus,
      chave_acesso: filtros.chaveAcesso,
      external_id: filtros.externalId
    };

    this.auth.obterToken()
    .pipe(switchMap(() => 
      this.service.listar(params)
    ))
    .subscribe({
      next: (resposta) => {
        this.nfse.set(resposta.data);
        this.total.set(resposta['@count']?? resposta.data.length);
        this.carregando.set(false);
      },
      error: err => {
        this.carregando.set(false);
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
