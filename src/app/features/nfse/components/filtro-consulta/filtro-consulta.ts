import { Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FiltrosNfse } from '../../models/filtros-nfse';

@Component({
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
  selector: 'app-filtro-consulta',
  styleUrl: './filtro-consulta.scss',
  templateUrl: './filtro-consulta.html',
})
export class FiltroConsulta {
  protected readonly form = new FormGroup({
    dataInicial: new FormControl<string>(''),
    dataFinal: new FormControl<string>(''),
    documento: new FormControl<string>(''),
    numeroNfse: new FormControl<string>('')
  });

  protected readonly consultar = output<FiltrosNfse>();

  protected enviar(): void {
    this.consultar.emit({
      dataInicial: this.form.controls.dataInicial.value ?? '',
      dataFinal: this.form.controls.dataFinal.value ?? '',
      documento: this.form.controls.documento.value ?? '',
      numeroNfse: this.form.controls.numeroNfse.value ?? ''
    });
  }
}
