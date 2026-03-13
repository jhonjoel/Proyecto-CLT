import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { environment } from '@environment/environment'; // Ajusta la ruta según la ubicación del archivo de entorno

@Injectable({
  providedIn: 'root',
})
export class Crd1GetService {
  constructor(private http: HttpClient) {}

  public getData(): Observable<any> {
    const url = environment.apiUrl;

    return this.http.post(url, {}).pipe(
      catchError((error) => {
        return throwError(error);
      })
    );
  }
}
