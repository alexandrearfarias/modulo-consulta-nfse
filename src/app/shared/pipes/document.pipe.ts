import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'document'})
export class DocumentPipe implements PipeTransform {
  transform(value: string | null | undefined): string {
    if (!value) {
      return '';
    }

    const documento = value.replace(/\D/g, '');
    if (documento.length === 11) {
      return documento.replace(
        /(\d{3})(\d{3})(\d{3})(\d{2})/,
        '$1.$2.$3-$4'
      );
    }
    if (documento.length === 14) {
      return documento.replace(
        /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
        '$1.$2.$3/$4-$5'
      );
    }

    return value;
  }
}
