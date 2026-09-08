import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FiltroConsulta } from '../../components/filtro-consulta/filtro-consulta';
import { FiltrosNfse } from '../../models/filtros-nfse';
import { NFSeService } from '../../services/nfse.sevice';
import { AuthService } from '../../../../core/auth/auth.service';
import { switchMap } from 'rxjs';
import { Nfse } from '../../models/nfse';

@Component({
  imports: [MatCardModule, FiltroConsulta],
  selector: 'app-consulta',
  styleUrl: './consulta.scss',
  templateUrl: './consulta.html',
})
export class Consulta {
  private readonly service = inject(NFSeService);
  private readonly auth = inject(AuthService);

  protected readonly nfse = signal<Nfse[]>([]);
  protected readonly carregando = signal(false);
  protected readonly total = signal(0);

  protected consultar(filtros: FiltrosNfse): void{
    console.log('filtros enviados: ', filtros);
    this.carregando.set(true);

    this.auth.obterToken()
    .pipe(switchMap(() => this.service.listar()))
    .subscribe({
      next: resposta => {
        this.nfse.set(resposta.data);
        this.total.set(resposta['@count'] ?? resposta.data.length);

        this.carregando.set(false);
        console.log('NFSe recebidas: ', resposta.data);
      },
      error: err => {
        this.carregando.set(false);
        console.error(err);
      }
    });
  }
}
