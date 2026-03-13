import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateFormatService {

  constructor() { }

  // Función para formatear la fecha en formato "yyyy-MM-dd"
  formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  formatDateDdMmYYYY(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${day}/${month}/${year}`;
  }
 
    // Método para formatear la fecha con la zona horaria actual py
    formatDateReal(fecha: string | Date| null): string | null {
      if (!fecha) {
        return null;
      }
    
      let dateObject: Date;
    
      if (fecha instanceof Date) {
        dateObject = fecha;
      } else {
        // Parsea la fecha asumiendo que está en formato UTC
        dateObject = new Date(fecha);
      }
    
      if (isNaN(dateObject.getTime())) {
        return null;
      }
    
      // Formatea la fecha manualmente en formato DD/MM/YYYY
      const day = dateObject.getUTCDate().toString().padStart(2, '0');
      const month = (dateObject.getUTCMonth() + 1).toString().padStart(2, '0'); // getUTCMonth() devuelve un valor de 0 a 11
      const year = dateObject.getUTCFullYear();
    
      return `${day}/${month}/${year}`;
    }
    
 


formatDateRealYYYYMMDD(fecha: string | Date): string | null {
  if (!fecha) {
    return null;
  }

  let dateObject: Date;

  if (fecha instanceof Date) {
    dateObject = fecha;
  } else {
    // Parsea la fecha asumiendo que está en formato UTC
    dateObject = new Date(fecha);
  }

  if (isNaN(dateObject.getTime())) {
    return null;
  }

  // Formatea la fecha manualmente en formato DD/MM/YYYY
  const day = dateObject.getUTCDate().toString().padStart(2, '0');
  const month = (dateObject.getUTCMonth() + 1).toString().padStart(2, '0'); // getUTCMonth() devuelve un valor de 0 a 11
  const year = dateObject.getUTCFullYear();

  return `${year}-${month}-${day}`;
}

}