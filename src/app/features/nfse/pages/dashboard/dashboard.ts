import { Component, inject, OnInit, signal } from '@angular/core';
import { NfseDashboardResumo, NfseDashboardService } from '../../services/nfse-dashboard.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';

@Component({
  imports: [MatCardModule, MatIconModule, CurrencyPipe],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit{
  private readonly dashboardService = inject(NfseDashboardService);

  protected readonly resumo = signal<NfseDashboardResumo|null>(null);
  protected readonly carregando = signal(true);

  async ngOnInit(): Promise<void> {
    try {
      const resumo = await this.dashboardService.obterResumo();

      this.resumo.set(resumo);
    } catch (error) {
      
    } finally {
      this.carregando.set(false);
    }
  }
}
