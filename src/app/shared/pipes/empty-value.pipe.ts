import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: 'emptyValue',
    standalone: true
})
export class EmptyValuePipe implements PipeTransform {
    transform(value: unknown): string {
        if (value === null || value === undefined || value === '') {
            return 'Não informado';
        }
        else {
            return String(value);
        }
    }
}
