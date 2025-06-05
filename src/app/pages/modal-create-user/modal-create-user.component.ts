import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  Validators,
  FormGroup,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogModule,
  MatDialogRef
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { UsersService } from 'app/services/users/users.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-create-user',
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
  templateUrl: './modal-create-user.component.html',
  styleUrls: ['./modal-create-user.component.scss']
})
export class ModalCreateUserComponent implements OnInit {
  formCreateUser!: FormGroup;
  administratorsValue: any[] = [];
  showFieldAdministrator: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly _formBuilder: FormBuilder,
    private readonly _userService: UsersService,
    private readonly _dialogRef: MatDialogRef<ModalCreateUserComponent>,
    private readonly _snackBar: MatSnackBar,
  ) {
    this.createFormUsers();

    this.formCreateUser.controls['confirmPassword'].valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe((value) => {
      this.validatePassword(value);
    });
  }

  ngOnInit(): void {
    console.log('🔍 DEBUG: Modal iniciado');
    this.getAllAdministrator();
  }

  private createFormUsers() {
    this.formCreateUser = this._formBuilder.group({
      nombre: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      rol_id: ['', Validators.required],
      administrador_id: [undefined]
    });

    console.log('🔍 DEBUG: Formulario creado', this.formCreateUser);
  }

  private getAllAdministrator() {
    console.log('🔍 DEBUG: Llamando a getAllAdministrator()');
    this._userService.getAllAdministrator().subscribe({
      next: (res) => {
        console.log('🔍 DEBUG: Respuesta de administradores:', res);
        this.administratorsValue = res.users;
        console.log('🔍 DEBUG: Administradores asignados a administratorsValue:', this.administratorsValue);
      },
      error: (err) => {
        console.error('❌ ERROR al obtener administradores:', err);
        this._snackBar.open('Error al cargar administradores', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  onChangeRole(event: any) {
    console.log('🔍 DEBUG: Rol seleccionado:', event.value);
    if (event.value === '1') {
      this.hideAdministratorField();
    } else {
      this.showAdministratorField();
    }
  }

  onSubmit() {
    console.log('🔍 DEBUG: Enviando formulario', this.formCreateUser.value);

    if (this.formCreateUser.invalid) {
      console.warn('⚠️ Formulario inválido:', this.formCreateUser.errors, this.formCreateUser);
      Swal.fire('Error', 'Por favor completa todos los campos requeridos', 'error');
      return;
    }

    const userData = {
      nombre: this.formCreateUser.get('nombre')?.value,
      email: this.formCreateUser.get('email')?.value,
      password: this.formCreateUser.get('password')?.value,
      rol_id: Number(this.formCreateUser.get('rol_id')?.value),
      administrador_id: this.formCreateUser.get('administrador_id')?.value
    };

    console.log('🔍 DEBUG: Datos enviados al backend:', userData);

    this._userService.createUser(userData).subscribe({
      next: (response) => {
        console.log('✅ Usuario creado correctamente:', response);
        this._snackBar.open('Usuario creado exitosamente', 'Cerrar', { duration: 3000 });
        this._dialogRef.close(true);
      },
      error: (error) => {
        console.error('❌ ERROR al crear usuario:', error);
        const errorMsg = error.error?.message || 'Error al crear usuario';
        this._snackBar.open(errorMsg, 'Cerrar', { duration: 5000 });
      }
    });
  }

  private validatePassword(confirmPassword: string) {
    const password = this.formCreateUser.get('password')?.value;
    if (password !== confirmPassword) {
      console.warn('⚠️ Contraseñas no coinciden');
      this.formCreateUser.get('confirmPassword')?.setErrors({ invalid: true });
    } else {
      this.formCreateUser.get('confirmPassword')?.setErrors(null);
    }
  }

  private showAdministratorField() {
    console.log('🔍 DEBUG: Mostrando campo administrador');
    this.showFieldAdministrator = true;
    this.formCreateUser.get('administrador_id')?.setValidators([Validators.required]);
    this.formCreateUser.get('administrador_id')?.updateValueAndValidity();
  }

  private hideAdministratorField() {
    console.log('🔍 DEBUG: Ocultando campo administrador');
    this.showFieldAdministrator = false;
    this.formCreateUser.get('administrador_id')?.clearValidators();
    this.formCreateUser.get('administrador_id')?.updateValueAndValidity();
    this.formCreateUser.get('administrador_id')?.setValue(null);
  }
}