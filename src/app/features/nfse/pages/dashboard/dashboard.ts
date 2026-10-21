import { Component, inject, OnInit, signal } from '@angular/core';
import { NfseDashboardResumo, NfseDashboardService, NfseDashboardStatus, NfseDashboardMensal } from '../../services/nfse-dashboard.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CurrencyPipe } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartData, ChartOptions } from 'chart.js';
import { MatButtonModule } from '@angular/material/button';

@Component({
  imports: [MatCardModule, MatIconModule, CurrencyPipe, BaseChartDirective, MatButtonModule],
  selector: 'app-dashboard',
  styleUrl: './dashboard.scss',
  templateUrl: './dashboard.html',
})
export class Dashboard implements OnInit{
  private readonly dashboardService = inject(NfseDashboardService);
  //TODO private readonly 

  protected readonly carregando = signal(true);
  protected readonly resumo = signal<NfseDashboardResumo|null>(null);
  protected readonly distribuicaoStatus = signal<NfseDashboardStatus[]>([]);
  protected readonly evolucaoMensal = signal<NfseDashboardMensal[]>([]);
  
  protected readonly graficoStatusData = signal<ChartData<'doughnut'>>({
    labels: [],
    datasets: [
      { data: [] }
    ]
  });

  protected readonly graficoStatusOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' }
    }
  };

  protected readonly graficoMensalData = signal<ChartData<'line'>>({
    labels: [],
    datasets: [
      { data: [] }
    ]
  });

  protected readonly graficoMensalOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'bottom' },
    },
    scales: {
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  // inicialização
  async ngOnInit(): Promise<void> {
    await this.atualizarIndicadores();
  }

  // Ações da página
  protected async atualizarIndicadores(): Promise<void> {
    this.carregando.set(true);

    try {
      const resumo = await this.dashboardService.obterResumo();
      const distribuicao = await this.dashboardService.obterDistribuicaoPorStatus();
      const evolucao = await this.dashboardService.obterEvolucaoMensal();

      this.resumo.set(resumo);
      this.distribuicaoStatus.set(distribuicao);
      this.evolucaoMensal.set(evolucao);

      this.graficoStatusData.set({
        labels: distribuicao.map(item => item.status),
        datasets: [
          { data: distribuicao.map(item => item.quantidade) }
        ]
      });

      this.graficoMensalData.set({
        labels: evolucao.map(item => {
          const [ano, mes] = item.mes.split('-');
          return `${mes}/${ano}`;
        }),
        datasets: [
          {
            label: 'NFS-e emitidas',
            data: evolucao.map(item => item.quantidade),
            tension: 0.3,
            fill: false
          }
        ]
      });
    } finally {
      this.carregando.set(false);
    }
  }
}
