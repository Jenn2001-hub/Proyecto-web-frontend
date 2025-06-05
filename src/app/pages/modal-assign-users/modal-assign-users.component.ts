// src/app/pages/modal-assign-users/modal-assign-users.component.ts
import { CommonModule } from '@angular/common';
import { Component, Inject, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef, MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ProjectsService } from '../../services/projects/projects.service';
import { User } from '@core/models/user';

@Component({
  selector: 'app-modal-assign-users',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule,
    MatTableModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './modal-assign-users.component.html',
  styleUrls: ['./modal-assign-users.component.scss']
})
export class ModalAssignUsersComponent {
  displayedColumns: string[] = ['projects', 'action'];
  dataSource = new MatTableDataSource<any>([]);
  
  @ViewChild(MatPaginator, {static: true}) paginator!: MatPaginator;

  userData!: User;
  userProjects: any[] = [];
  allProjects: any[] = [];
  isLoading = false;
  formAssignProject!: FormGroup;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: User,
    private readonly _snackBar: MatSnackBar,
    private readonly _projectService: ProjectsService,
    private readonly dialogRef: MatDialogRef<ModalAssignUsersComponent>,
    private readonly _formBuilder: FormBuilder,
  ) {}

  ngOnInit() {
    if (this.data) {
      this.loadUserData(this.data);
    }
    this.getAllProjects();
    this.updateFormAssign();
  }

  updateFormAssign() {
    this.formAssignProject = this._formBuilder.group({
      projectId: ['', Validators.required],
    });
  }

  loadUserData(user: User) {
    this.userData = user;
    this.getAllUserProjects(user.id);
  }
  
  getAllProjects() {
    this.isLoading = true;
    this._projectService.getAllProjects().subscribe({ 
      next: (response: any) => {
        this.allProjects = response.proyectos;
        this.filterProjects();
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this._snackBar.open('Error al cargar proyectos', 'Cerrar', { duration: 3000 });
      }
    });
  }

  filterProjects() {
    const assignedProjectIds = this.userProjects.map(p => p.id);
    this.allProjects = this.allProjects.filter(project => 
      !assignedProjectIds.includes(project.id)
    );
  }

  getAllUserProjects(userId: number) {
    this.isLoading = true;
    this._projectService.getAllProjectsByUser(userId).subscribe({
      next: (response: any) => {
        this.userProjects = response.proyectos;
        this.dataSource.data = response.proyectos;
        this.isLoading = false;
        this.filterProjects();
      },
      error: () => {
        this.isLoading = false;
        this._snackBar.open('Error al cargar proyectos', 'Cerrar', { duration: 3000 });
      }
    });
  }
  
  assignProject() {
    const projectId = this.formAssignProject.value.projectId;
    const userId = [this.userData.id];
    if (!userId) return;
    this._projectService.assignUsersToProject(projectId, userId).subscribe({
      next: () => {
        this._snackBar.open('Usuario asociado del proyecto', 'Cerrar', { duration: 3000 });
        this.getAllUserProjects(this.userData.id);
      },
      error: () => {
        this._snackBar.open('Error al asociar usuario del proyecto', 'Cerrar', { duration: 3000 });
      }
    });
  }

  unassignProject(project: any) {
    const userId = this.userData.id;
    if (!userId) return;
    this._projectService.removeUserFromProject(project.id, userId).subscribe({
      next: () => {
        this._snackBar.open('Usuario desasociado del proyecto', 'Cerrar', { duration: 3000 });
        this.getAllUserProjects(userId);
      },
      error: () => {
        this._snackBar.open('Error al desasociar usuario del proyecto', 'Cerrar', { duration: 3000 });
      }
    });
  }
}