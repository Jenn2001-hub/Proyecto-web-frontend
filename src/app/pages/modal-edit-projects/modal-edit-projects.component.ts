// src/app/pages/modal-edit-projects/modal-edit-projects.component.ts
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MAT_DIALOG_DATA, MatDialogModule,
  MatDialogActions, MatDialogClose, MatDialogTitle,
  MatDialogContent, MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UsersService } from '../../services/users/users.service';
import { ProjectsService } from '../../services/projects/projects.service';

@Component({
  selector: 'app-modal-edit-projects',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule, 
    MatDialogModule, 
    MatButtonModule, 
    MatSelectModule,
    MatIconModule, 
    MatFormFieldModule, 
    MatInputModule, 
    ReactiveFormsModule
  ],
  templateUrl: './modal-edit-projects.component.html',
  styleUrls: ['./modal-edit-projects.component.scss']
})
export class ModalEditProjectsComponent {
  formUpdateProjects!: FormGroup;
  usersValues: any[] = [];
  administratorsValues: any[] = [];
  isLoading = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly _formBuilder: FormBuilder,
    private readonly _snackBar: MatSnackBar,
    private readonly _userService: UsersService,
    private readonly _projectService: ProjectsService,
    private readonly dialogRef: MatDialogRef<ModalEditProjectsComponent>
  ) {
    this.updateFormProjects();
    this.getAllUserByAdministrator();
    this.getAllAdministrator();
  }

  ngOnInit() {
    if (this.data) {
      this.loadProjectData(this.data);
    }
  }

  updateFormProjects() {
    this.formUpdateProjects = this._formBuilder.group({
      id: ['', Validators.required],
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      admin_id: ['', Validators.required],
      usuarios: ['', Validators.required]
    });
  }

  loadProjectData(project: any) {
    this.formUpdateProjects.patchValue({
      id: project.id,
      nombre: project.nombre,
      descripcion: project.descripcion,
      admin_id: project.admin_id,
      usuarios: project.usuarios,
    });
  }

  getAllUserByAdministrator() {
    this.isLoading = true;
    this._userService.getAllUserByAdministrator().subscribe({
      next: (response: any) => {
        this.usersValues = response.users;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  getAllAdministrator() {
    this.isLoading = true;
    this._userService.getAllAdministrator().subscribe({
      next: (response: any) => {
        this.administratorsValues = response.users;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  updateProjects() {
    if (this.formUpdateProjects.valid) {
      const projectData = this.formUpdateProjects.value;
      const projectId = this.data?.id;
      this._projectService.updateProject(projectId, projectData).subscribe({
        next: (response: any) => {
          const updatedProject = response.updatedProject;
          this._snackBar.open(response.message, 'Cerrar', {duration: 5000});
          this.dialogRef.close(updatedProject);
        },
        error: (error: any) => {
          const errorMessage = error.error?.result || 'Ocurrió un error inesperado. Por favor intenta nuevamente.';
          this._snackBar.open(errorMessage, 'Cerrar', {duration: 5000});
        }
      });
    }
  }
}