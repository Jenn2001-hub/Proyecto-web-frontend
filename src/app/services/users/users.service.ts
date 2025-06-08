// Importa módulos necesarios para HTTP y programación reactiva
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
// Importa la URL base de los servicios desde la configuración
import { URL_SERVICIOS } from '@core/models/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

// Decorador que marca la clase como un servicio inyectable disponible en toda la app
@Injectable({
  providedIn: 'root'
})
export class UsersService {
  // Almacena la URL base para los endpoints de la API
  urlBaseServices: string = URL_SERVICIOS;

  // Constructor con inyección de dependencia del HttpClient
  constructor(private readonly http: HttpClient) { }

  createUser(userData: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/user/create`;
    return this.http.post<any>(endpoint, userData);
  }

  updateUser(userId: number, userData: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/user/update/${userId}`;
    return this.http.put<any>(endpoint, userData);
  }

  deleteUser(userId: number): Observable<any> {
    const endpoint = `${this.urlBaseServices}/user/delete/${userId}`;
    return this.http.delete<any>(endpoint);
  }

  getAllUserByAdministrator(filters?: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/user`;
    let params = new HttpParams();
  
    if (filters) {
      if (filters.nombre) params = params.set('nombre', filters.nombre);
      if (filters.email) params = params.set('email', filters.email);
    }
    
    return this.http.get<any>(endpoint, { params }).pipe(
      map((response: any) => {
        // Normalizar la respuesta
        return {
          users: response.data || response.users || response
        };
      })
    );
  }

  getAllAdministrator(): Observable<any> {
    const endpoint = `${this.urlBaseServices}/user/rol/1`;
    return this.http.get<any>(endpoint);
  }

  getAllUsers(): Observable<any> {
    const endpoint = `${this.urlBaseServices}/user/rol/2`;
    return this.http.get<any>(endpoint);
  }
}