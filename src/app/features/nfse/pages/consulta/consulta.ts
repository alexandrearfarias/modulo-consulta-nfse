import { Component } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { FiltroConsulta } from '../../components/filtro-consulta/filtro-consulta';
import { FiltrosNfse } from '../../models/filtros-nfse';

@Component({
  imports: [MatCardModule, FiltroConsulta],
  selector: 'app-consulta',
  styleUrl: './consulta.scss',
  templateUrl: './consulta.html',
})
export class Consulta {
  protected consultar(filtros: FiltrosNfse): void{
    console.log('filtros enviados: ', filtros);
  }
}
