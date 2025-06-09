import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from '@shared/components/breadcrumb/breadcrumb.component';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectsService } from 'app/services/projects/projects.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ModalCreateProjectComponent } from '../modal-create-project/modal-create-project.component';
import { ModalEditProjectsComponent } from '../modal-edit-projects/modal-edit-projects.component';
import { AuthService } from '@core';
import { ModalViewProjectComponent } from '../modal-view-project/modal-view-project.component';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    BreadcrumbComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatInputModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatIconModule,
    MatPaginatorModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatDialogModule
  ],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {
  displayedColumns: string[] = [
    'nombre',
    'descripcion',
    'fecha_creacion',
    'total_usuarios',
    'administrador',
    'action'
  ];

  breadscrums = [
    {
      title: 'Gestión de proyectos',
      item: [],
      active: 'Datos básicos',
    },
  ];

  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  projectFormSearchFilter!: FormGroup;
  projectsList: any[] = [];
  isLoading = false;
  userRole: any;

  projectDefaultFilterSearch: any = {
    nombre: undefined,
  }

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly projectService: ProjectsService,
    private readonly dialogModel: MatDialog,
    private readonly _snackBar: MatSnackBar,
    private readonly authService: AuthService,
  ) { }

  ngOnInit(): void {
    const userInfo = this.authService.getAuthFromSessionStorage();
    const userId = userInfo.id;
    this.userRole = userInfo.rol_id;
    
    this.createProjectFormSearchFilter();
    
    if (userId === 1) {
      this.getAllProjects();
    } else {
      this.getProjectsByUserId(userId);
    }
    
    this.handleProjectFilterChance('nombre', 'nombre');
  }

  createProjectFormSearchFilter() {
    this.projectFormSearchFilter = this._formBuilder.group({
      nombre: ['']
    });
  }

  handleProjectFilterChance(controlName: string, filterKey: string) {
    this.projectFormSearchFilter.controls[controlName].valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((value: any) => {
      this.projectDefaultFilterSearch[filterKey] = value;
      this.refreshProjectsListWithFilters();
    });
  }

  refreshProjectsListWithFilters(): void {
    const userInfo = this.authService.getAuthFromSessionStorage();
    const userId = userInfo.id;
    
    if (userId === 1) {
      this.getAllProjects(this.projectDefaultFilterSearch);
    } else {
      this.getProjectsByUserId(userId);
    }
  }

  getAllProjects(filters?: any): void {
    this.isLoading = true;
    
    this.projectService.getAllProjects().subscribe({
      next: (response) => {
        let projects = response.proyectos || response.projects || response;
        
        if (filters?.nombre) {
          const searchTerm = filters.nombre.toLowerCase();
          projects = projects.filter((project: any) => 
            project.nombre.toLowerCase().includes(searchTerm)
          );
        }
        
        this.projectsList = projects;
        this.dataSource.data = this.projectsList;
        this.dataSource.paginator = this.paginator;
        this.isLoading = false;
      },
      error: (error) => {
        this._snackBar.open('Error al obtener proyectos', 'Cerrar', {duration: 3000});
        this.isLoading = false;
      }
    });
  }

  getProjectsByUserId(userId: number): void {
    this.isLoading = true;
    this.projectService.getProjectsByUserId(userId).subscribe({
      next: (response) => {
        let projects = response.proyectos || response.projects || response;
        
        if (this.projectDefaultFilterSearch.nombre) {
          const searchTerm = this.projectDefaultFilterSearch.nombre.toLowerCase();
          projects = projects.filter((project: any) => 
            project.nombre.toLowerCase().includes(searchTerm)
          );
        }
        
        this.projectsList = projects;
        this.dataSource.data = this.projectsList;
        this.dataSource.paginator = this.paginator;
        this.isLoading = false;
      },
      error: (error) => {
        this._snackBar.open('Error al obtener proyectos del usuario', 'Cerrar', {duration: 3000});
        this.isLoading = false;
      }
    });
  }

  openModalViewProject(project: any): void {
    const dialogRef = this.dialogModel.open(ModalViewProjectComponent, {
      width: '800px',
      maxWidth: '95vw',
      maxHeight: '90vh',
      data: { project: project },
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.refreshProjectsList();
      }
    });
  }

  refreshProjectsList(): void {
    const userInfo = this.authService.getAuthFromSessionStorage();
    const userId = userInfo.id;
    
    if (userId === 1) {
      this.getAllProjects();
    } else {
      this.getProjectsByUserId(userId);
    }
  }

  openModalCreateProject(): void {
    const dialogRef = this.dialogModel.open(ModalCreateProjectComponent, {
      minWidth: '300px',
      maxWidth: '1000px',
      width: '820px',
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshProjectsList();
      }
    });
  }

  openModalUpdateProject(projectInformation: any): void {
    const dialogRef = this.dialogModel.open(ModalEditProjectsComponent, {
      minWidth: '300px',
      maxWidth: '1000px',
      width: '820px',
      disableClose: true,
      data: { project: projectInformation }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.refreshProjectsList();
      }
    });
  }

  deleteProject(projectId: number): void {
    this.projectService.deleteProject(projectId).subscribe({
      next: (response) => {
        this._snackBar.open(response.message || 'Proyecto eliminado correctamente', 'Cerrar', { duration: 5000 });
        this.refreshProjectsList();
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Error al eliminar el proyecto';
        this._snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      }
    });
  }
}