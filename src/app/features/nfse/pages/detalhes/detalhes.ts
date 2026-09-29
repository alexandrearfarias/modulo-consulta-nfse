import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NFSeDatabaseService } from '../../../../core/database/nfse-database.service';
import { Nfse } from '../../models/nfse';
import { MatCardModule } from '@angular/material/card';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { DocumentPipe } from '../../../../shared/pipes/document.pipe';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { EmptyValuePipe } from '../../../../shared/pipes/empty-value.pipe';

@Component({
  imports: [
    MatCardModule,
    DatePipe,
    DocumentPipe,
    CurrencyPipe,
    MatProgressSpinnerModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    EmptyValuePipe
],
  selector: 'app-detalhes',
  styleUrl: './detalhes.scss',
  templateUrl: './detalhes.html'
})
export class Detalhes implements OnInit {
  // injeções dedependências
  private readonly route = inject(ActivatedRoute);
  private readonly database = inject(NFSeDatabaseService);
  private readonly router = inject(Router);

  // parametros e objetos
  protected readonly nfse = signal<Nfse|null>(null);
  protected readonly carregando = signal(true);

  // inicialização
  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.carregando.set(false);
      return;
    }

    const resultado = await this.database.buscar(id);

    this.nfse.set(resultado ?? null);
    this.carregando.set(false);
  }

  // ações
  protected voltar(): void {
    this.router.navigate([''])
  }

  // auxiliares
  protected statusLabel(status: Nfse['status']): string {
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

  protected adnStatusLabel(adnStatus: Nfse['adn_status']): string {
    const labels: Record<Nfse['adn_status'], string> = {
      pendig: 'Pendente',
      shared: 'Compartilhada',
      rejected: 'Rejeitada',
      error: 'Erro'
    };
    return labels[adnStatus];
  }

  protected statusClass(status: Nfse['status']): string {
    const classes: Record<Nfse['status'], string> = {
      processing: 'status-processing',
      issued: 'status-issued',
      rejected: 'status-rejected',
      canceled: 'status-canceled',
      substituted: 'status-substituted',
      error: 'status-error'
    };
    return classes[status];
  }

  protected adnStatusClass(status: Nfse['adn_status']): string {
    const classes: Record<Nfse['adn_status'], string> = {
      pending: 'status-processing',
      shared: 'status-issued',
      rejected: 'status-rejected',
      error: 'status-error'
    };
    return classes[status];
  }
}
