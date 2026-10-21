import { Injectable, signal } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class NfseSyncEventService {
  private readonly _sincronizacaoConcluida = signal(0);
  readonly sincronizacaoConcluida = this._sincronizacaoConcluida.asReadonly();

  notificarSincronizacaoConcluida(): void {
    this._sincronizacaoConcluida.update(valor => valor + 1);
  }
}
