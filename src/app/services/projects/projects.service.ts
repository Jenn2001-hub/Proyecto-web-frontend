// src/app/services/projects/projects.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { URL_SERVICIOS } from '@core/models/config';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectsService {
  urlBaseServices: string = URL_SERVICIOS;

  constructor(private readonly http: HttpClient) { }

  createProject(projectData: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/projects/create`;
    return this.http.post<any>(endpoint, projectData);
  }

  updateProject(projectId: number, projectData: any): Observable<any> {
    const endpoint = `${this.urlBaseServices}/projects/update/${projectId}`;
    return this.http.put<any>(endpoint, projectData);
  }

  deleteProject(projectId: number): Observable<any> {
    const endpoint = `${this.urlBaseServices}/projects/delete/${projectId}`;
    return this.http.delete<any>(endpoint);
  }

  getAllProjects(): Observable<any> {
    const endpoint = `${this.urlBaseServices}/projects`;
    return this.http.get<any>(endpoint);
  }

  getAllProjectsByUser(userId: number): Observable<any> {
    const endpoint = `${this.urlBaseServices}/projects/user/${userId}`;
    return this.http.get<any>(endpoint);
  }
  
  assignUsersToProject(projectId: number, userIds: any[]): Observable<any> {
    const projectData = {
      projectId: projectId,
      userIds: userIds
    };
    const endpoint = `${this.urlBaseServices}/projects/associate`;
    return this.http.post<any>(endpoint, projectData);
  }

  removeUserFromProject(projectId: number, userId: number): Observable<any> {
    const endpoint = `${this.urlBaseServices}/projects/disassociate/${projectId}/${userId}`;
    return this.http.delete<any>(endpoint);
  }
}