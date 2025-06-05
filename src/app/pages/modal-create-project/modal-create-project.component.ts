// src/app/pages/modal-create-project/modal-create-project.component.ts
import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { UsersService } from '../../services/users/users.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectsService } from '../../services/projects/projects.service';

@Component({
  selector: 'app-modal-create-project',
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
  templateUrl: './modal-create-project.component.html',
  styleUrls: ['./modal-create-project.component.scss']
})
export class ModalCreateProjectComponent implements OnInit {
  formCreateProject!: FormGroup;
  administratorsValues: any[] = [];
  usersValues: any[] = [];
  showFieldAdministrator: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly _formBuilder: FormBuilder,
    private readonly _userService: UsersService,
    private readonly _projectService: ProjectsService,
    private readonly dialogRef: MatDialogRef<ModalCreateProjectComponent>,
    private readonly _snackBar: MatSnackBar,
  ) {
    this.createFormProject();
    
    this.formCreateProject.controls['confirmPassword']?.valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe((value) => {
      this.validatePassword(value);
    });
  }

  ngOnInit(): void {
    this.getAllAdministrator();
    this.getAllUsers();
  }
  
  private createFormProject() {
    this.formCreateProject = this._formBuilder.group({
      nombre: ['', Validators.required],
      descripcion: ['', Validators.required],
      admin_id: ['', Validators.required],
      usuarios: [[]]
    });
  }

  private getAllAdministrator() {
    this._userService.getAllAdministrator().subscribe({
      next: (res: any) => {
        this.administratorsValues = res.users;
      },
      error: (err) => {
        console.error(err);
        this._snackBar.open('Error al cargar administradores', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  private getAllUsers() {
    this._userService.getAllUsers().subscribe({
      next: (res: any) => {
        this.usersValues = res.users;
      },
      error: (err) => {
        console.error(err);
        this._snackBar.open('Error al cargar usuarios', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  createProject() {
    if (this.formCreateProject.invalid) {
      Swal.fire('Error', 'Por favor completa todos los campos requeridos', 'error');
      return;
    }
    
    const projectData = this.formCreateProject.value;
    this._projectService.createProject(projectData).subscribe({
      next: (response) => {
        this._snackBar.open('Proyecto creado exitosamente', 'Cerrar', { duration: 3000 });
        this.dialogRef.close(true);
      },
      error: (error) => {
        this._snackBar.open(error.error?.message || 'Error al crear proyecto', 'Cerrar', { duration: 5000 });
      }
    });
  }

  private validatePassword(confirmPassword: string) {
    const password = this.formCreateProject.get('password')?.value;
    if (password !== confirmPassword) {
      this.formCreateProject.get('confirmPassword')?.setErrors({ invalid: true });
    } else {
      this.formCreateProject.get('confirmPassword')?.setErrors(null);
    }
  }
}