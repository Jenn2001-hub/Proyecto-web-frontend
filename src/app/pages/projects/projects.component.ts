import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BreadcrumbComponent } from 'app/shared/components/breadcrumb/breadcrumb.component';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { UsersService } from 'app/services/users/users.service';
import { MatDialog } from '@angular/material/dialog';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ProjectsService } from 'app/services/projects/projects.service';
import { ModalCreateProjectComponent } from 'app/pages/modal-create-project/modal-create-project.component';
import { User } from '@core/models/user';
import { ProjectsDetailComponent } from 'app/pages/projects-detail/projects-detail.component';

export interface Project {
  id: number;
  name: string;
  usuarios: User[];
}

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatOptionModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatTooltipModule,
    BreadcrumbComponent,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    ProjectsDetailComponent
  ],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements AfterViewInit {
  displayedColumns: string[] = [
    'nombre',
    'fecha_creacion',
    'admin',
    'usuarios',
    'action'
  ];

  breadscrums = [
    {
      title: 'Gestión de proyectos',
      items: [],
      active: 'Datos básicos',
    },
  ];

  dataSource = new MatTableDataSource<any>([]);
  @ViewChild(MatPaginator, {static: true}) paginator!: MatPaginator;
  
  projectFormsSearchFilter!: FormGroup;
  projectsList: any[] = [];
  selectedProject: any = null;
  isLoading = false;

  projectDefaultFilterSearch: any = {
    name: undefined,
    user: undefined,
  }

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly projectService: ProjectsService,
    private readonly dialogModel: MatDialog,
    private readonly _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.createProjectFormSearchFilter();
    this.getAllProjects();
    this.handlerNameFilterChange('name', 'name');
    this.handleUserFilterChange('user', 'user');
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }
  
  private createProjectFormSearchFilter() {
    this.projectFormsSearchFilter = this._formBuilder.group({
      name: [''],
      user: ['']
    });
  }

  getAllProjects(): void {
    this.isLoading = true;
    this.projectService.getAllProjects().subscribe({
      next: (response: any) => {
        this.projectsList = response.proyectos;
        this.dataSource.data = response.proyectos;
        this.dataSource.paginator = this.paginator;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private handlerNameFilterChange(controlName: string, filterKey: string) {
    this.projectFormsSearchFilter.get(controlName)?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((value) => {
        this.projectDefaultFilterSearch[filterKey] = value?.trim() || undefined;
        this.getAllProjects();
      });
  }

  private handleUserFilterChange(controlName: string, filterKey: string) {
    this.handlerNameFilterChange(controlName, filterKey);
  }

  openCreateModal(): void {
    const dialogRef = this.dialogModel.open(ModalCreateProjectComponent, {
      width: '1200px', 
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllProjects();
      }
    });
  }

  getNombresUsuarios(project: Project): string {
    return project.usuarios?.map(u => u.nombre).join(', ') || '';
  }

  deleteProject(project: any): void {
    const projectId = project?.id;
    if (projectId) {
      this.projectService.deleteProject(projectId).subscribe({
        next: (response: any) => {
          this._snackBar.open('Proyecto eliminado correctamente', 'Cerrar', { duration: 3000 });
          this.getAllProjects();
        },
        error: (error: any) => {
          this._snackBar.open('Error al eliminar proyecto', 'Cerrar', { duration: 3000 });
        }
      });
    }
  }

  viewProjectDetail(project: any): void {
    this.selectedProject = project;
  }
}