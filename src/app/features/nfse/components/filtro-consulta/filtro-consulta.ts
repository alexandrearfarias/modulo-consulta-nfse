import { Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FiltrosNfse } from '../../models/filtros-nfse';
import { MatSelectModule } from '@angular/material/select';

@Component({
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule],
  selector: 'app-filtro-consulta',
  styleUrl: './filtro-consulta.scss',
  templateUrl: './filtro-consulta.html',
})
export class FiltroConsulta {
  protected readonly form = new FormGroup({
    status: new FormControl<string>(''),
    adnStatus: new FormControl<string>(''),
    chaveAcesso: new FormControl<string>(''),
    externalId: new FormControl<string>('')
  });

  protected readonly statusOptions = [
    { value: 'issued', text: 'Emitida' },
    { value: 'processing', text: 'Em processamento' },
    { value: 'rejected', text: 'Rejeitada' },
    { value: 'canceled', text: 'Cancelada' },
    { value: 'substituted', text: 'Substituída' },
    { value: 'error', text: 'Erro' }
  ];
   protected readonly adnStatusOptions = [
    { value: 'pending', text: 'Pendente' },
    { value: 'shared', text: 'Compartilhada' },
    { value: 'rejected', text: 'Rejeitada' },
    { value: 'error', text: 'Erro' }
   ];

  protected readonly consultar = output<FiltrosNfse>();

  protected enviar(): void {
    this.consultar.emit({
      status: this.form.controls.status.value ?? '',
      adnStatus: this.form.controls.adnStatus.value ?? '',
      chaveAcesso: this.form.controls.chaveAcesso.value ?? '',
      externalId: this.form.controls.externalId.value ?? ''
    });
  }
}
