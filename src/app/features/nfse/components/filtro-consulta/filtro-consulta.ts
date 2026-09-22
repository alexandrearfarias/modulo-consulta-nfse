import { Component, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FiltrosNfse } from '../../models/filtros-nfse';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

@Component({
  imports: [ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatDatepickerModule],
  providers: [provideNativeDateAdapter(), { provide: MAT_DATE_LOCALE, useValue: 'pt-BR' }],
  selector: 'app-filtro-consulta',
  styleUrl: './filtro-consulta.scss',
  templateUrl: './filtro-consulta.html',
})
export class FiltroConsulta {
  protected readonly form = new FormGroup({
    status: new FormControl<string>(''),
    adnStatus: new FormControl<string>(''),

    chaveAcesso: new FormControl<string>(''),
    externalId: new FormControl<string>(''),

    dataInicial: new FormControl<Date | null>(null),
    dataFinal: new FormControl<Date | null>(null),

    prestadorCpfCnpj: new FormControl<string>(''),
    tomadorCpfCnpj: new FormControl<string>('')
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
      externalId: this.form.controls.externalId.value ?? '',

      dataInicial: this.formatarData(this.form.controls.dataInicial.value),
      dataFinal: this.formatarData(this.form.controls.dataFinal.value),

      prestadorCpfCnpj: this.formatarCpfCnpj(this.form.controls.prestadorCpfCnpj.value),
      tomadorCpfCnpj: this.formatarCpfCnpj(this.form.controls.tomadorCpfCnpj.value)
    });
  }

  protected limpar(): void {
    this.form.reset();

    this.consultar.emit({
      status: '',
      adnStatus: '',
      chaveAcesso: '',
      externalId: '',
      dataInicial: undefined,
      dataFinal: undefined,
    })
  }

  // auxiliar
  private formatarData(data: Date | null): string | undefined {
    if (!data) { return undefined; }

    const ano = data.getFullYear();
    const mes = String(data.getMonth() +1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  private formatarCpfCnpj(value: string | null): string | undefined {
    if (!value) { return undefined; }
    return value.replace(/[^0-9a-zA-Z]/g, '');
  }
}
