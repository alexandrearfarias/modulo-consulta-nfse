import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NFSeDatabaseService } from '../../../../core/database/nfse-database.service';
import { Nfse } from '../../models/nfse';
import { MatCardModule } from '@angular/material/card';
import { CurrencyPipe, DatePipe } from '@angular/common';
import { DocumentPipe } from '../../../../shared/pipes/document.pipe';

@Component({
  imports: [
    MatCardModule,
    DatePipe,
    DocumentPipe,
    CurrencyPipe
  ],
  selector: 'app-detalhes',
  styleUrl: './detalhes.scss',
  templateUrl: './detalhes.html'
})
export class Detalhes implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly database = inject(NFSeDatabaseService);

  protected readonly nfse = signal<Nfse|null>(null);

  async ngOnInit(): Promise<void> {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    const resultado = await this.database.buscar(id);

    this.nfse.set(resultado ?? null);
  }
}
