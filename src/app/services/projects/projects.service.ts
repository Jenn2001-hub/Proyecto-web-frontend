import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from '@core/models/config';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  urlBaseServices: string = URL_SERVICIOS;

  constructor(private readonly http: HttpClient) { }

  createProject(projectData: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/project/create`;
    return this.http.post<any>(endpoint, projectData);
  }

  updateProject(projectId: number, projectData: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/project/update/${projectId}`;
    return this.http.put<any>(endpoint, projectData);
  }

  getAllProjects(filters?: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/project/`;
    return this.http.get<any>(endpoint, { params: filters }).pipe(
      map((response: any) => {
        return {
          proyectos: response.data || response.proyectos || response
        };
      })
    );
  }

  getProjectsByUserId(userId: number): Observable<any> {
    const endpoint = `${this.urlBaseServices}/project/${userId}`;
    return this.http.get<any>(endpoint).pipe(
      map((response: any) => {
        return {
          proyectos: response.data || response.proyectos || response
        };
      })
    );
  }

  deleteProject(projectId: number): Observable<any> {
    const endpoint = `${this.urlBaseServices}/project/delete/${projectId}`;
    return this.http.delete<any>(endpoint);
  }

  assingUsersToProject(data: {project_id: number, usuario_ids: number[]}): Observable<any> {
    const endpoint = `${this.urlBaseServices}/project/associate`;
    return this.http.post<any>(endpoint, {
      proyecto_id: data.project_id,
      usuario_id: data.usuario_ids,
      administrador_id: data.usuario_ids[0] // Enviamos el primer usuario como admin (ajustar según necesidad)
    });
  }

  removeUserFromProject(data: {project_id: number, usuario_id: number}): Observable<any> {
    const endpoint = `${this.urlBaseServices}/project/disassociate`;
    return this.http.request('delete', endpoint, { 
      body: {
        proyecto_id: data.project_id,
        usuario_id: data.usuario_id,
        administrador_id: data.usuario_id // Usamos el mismo usuario como admin para simplificar
      } 
    });
  }
}