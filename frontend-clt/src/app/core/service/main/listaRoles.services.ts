import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Roles } from '@models/Roles';
import { environment } from '@environment/environment';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  private endpoint = '/roles';
  private apiUrl = `${environment.apiUrl}${this.endpoint}`;

  constructor(private http: HttpClient) {}

  getRoles(): Observable<{ roles: Roles[] }> {
    return this.http.post<{ roles: Roles[] }>(this.apiUrl, {});
  }
}
