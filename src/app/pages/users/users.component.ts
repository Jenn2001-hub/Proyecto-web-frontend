// Importa las bibliotecas y componentes necesarios
import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { matDatepickerAnimations, MatDatepickerModule } from '@angular/material/datepicker';
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
import { MatTableDataSource,  MatTableModule } from '@angular/material/table';
import { MatProgressSpinner, MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsersService } from 'app/services/users/users.service';
// import { ModalCreateUserComponent } from 'app/pages/modal-create-user/modal-create-user.component';
import { MatDialog } from '@angular/material/dialog';
// import { ModalEditUsersComponent } from 'app/pages/moda-edit-users/modal-edit-users.component';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { Title } from 'chart.js';
import { ModalCreateUserComponent } from '../modal-create-user/modal-create-user.component';
import { ModalEditUsersComponent } from '../modal-edit-users/modal-edit-users.component';

// Define la interfaz para un usuario
export interface User {
  nombre: string;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [ // se vuelve a importa los componentes y módulos necesarios
    CommonModule,
    BreadcrumbComponent,
    MatFormFieldModule,
    MatSelectModule,
    MatOptionModule,
    MatDatepickerModule,
    MatInputModule,
    MatTooltipModule,
    ReactiveFormsModule,
    MatSnackBarModule,
    MatAutocompleteModule,
    MatIconModule,
    MatPaginatorModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss'
})
export class UsersComponent {

   // Columnas de la tabla de usuarios
  displayedColumns: string[] = [
    'nombre',
    'email',
    'role',
    'action'
  ];

  // Breadcrumbs del componente
  breadscrums = [
    {
      title: 'Gestión de usuarios',
      item: [],
      active: 'Datos básicos',
    },
  ];

  breadscrumsDetails = [
    { 
      title: '',
    },
  ];

  // Table
  dataSource = new MatTableDataSource<any>([]); // Fuente de datos para la tabla de usuarios
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator; // Paginador de la tabla de usuarios, para controlar cuantos usuarios mostrar al inicio

  // Search
  userFormSearchFilter!: FormGroup;  // Formulario de búsqueda de usuarios
  usersList: any[] = []; // Lista de usuarios

  isLoading = false; // Indica si se está cargando, en este caso la lista

  // Filtros de búsqueda por defecto
  userDefaultFilterSearch: any = {
    nombre: undefined,
    email: undefined,
  }

  constructor(
    private readonly _formBuilder: FormBuilder,
    private readonly userService: UsersService,
    private readonly dialogModel: MatDialog,
    private readonly _snackBar: MatSnackBar
  ) { }
  
  // Método que se ejecuta cuando se inicializa el componente
  ngOnInit(): void {
    this.createUserFormSearchFilter();  // Crea el formulario de búsqueda de usuarios
    this.getAllUserByAdministrator(); // Obtiene la lista de usuarios
     // Configuración de los filtros de búsqueda
    this.handleUserFilterChance('nombre', 'nombre');
    this.handleUserFilterChance('email', 'email');
  }

  // Método que crea el formulario de búsqueda de usuarios
  createUserFormSearchFilter() {
    this.userFormSearchFilter = this._formBuilder.group({
      nombre: [''],
      email: ['']
    });
  }

  // Conversor de los roles 1 y 2 a administrador y usuarios
  getRoleName(rol_id: number): string {
    switch (rol_id) {
      case 1:
        return 'Administrador';
      case 2:
        return 'Usuarios';
      default:
        return 'Desconocido';
    }
  }

  // Metodo que escucha cambios utiliza dos operadores para hacer la peticion y Actualiza los filtros con lo que esta buscando el usuario
  handleUserFilterChance(controlName: string, filterKey: string) {
    this.userFormSearchFilter.controls[controlName].valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe((value: any) => {
      this.userDefaultFilterSearch[filterKey] = value; // Actualiza el filtro de búsqueda con el valor actual
      console.log(this.userDefaultFilterSearch);
      this.getAllUserByAdministrator({ ...this.userDefaultFilterSearch, [filterKey]: value });// Llama al método para obtener la lista de usuarios con los filtros actualizados
    });
  }

  // Método que obtiene la lista de usuarios
  getAllUserByAdministrator(filters?: any): void {
    console.log('Filtros enviados:', filters);
    this.isLoading = true;
    this.userService.getAllUserByAdministrator(filters).subscribe({
      next: (response) => {
        // Verificar la estructura real de la respuesta
        this.usersList = response.users || response.usuarios || response;
        console.log('listando', this.usersList);
        this.dataSource.data = this.usersList;
        this.dataSource.paginator = this.paginator;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al obtener usuarios:', error);
        this.isLoading = false;
        this._snackBar.open('Error al cargar usuarios', 'Cerrar', {duration: 3000});
      }
    });
  }

  // Método que abre el modal de creación de usuarios
  openModalCreateUser(): void {
    // Abre el modal de creación de usuarios con las configuraciones especificadas
    const dialogRef = this.dialogModel.open(ModalCreateUserComponent, {
      minWidth: '300px',
      maxWidth: '1000px',
      width: '820px',
      disableClose: true,
    });

     // Escucha el evento de cierre del modal y actualiza la lista de usuarios si se creó un nuevo usuario
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllUserByAdministrator();
      }
    })
  }

  // Método que abre el modal de edición de usuarios
  openModalUpdateUsers(userIformation: any): void {
    // lo mismo, abre el modal de edición de usuarios con las configuraciones especificadas y pasa la información del usuario
    const dialogRef = this.dialogModel.open(ModalEditUsersComponent, {
      minWidth: '300px',
      maxWidth: '1000px',
      width: '820px',
      disableClose: true,
      data: {user: userIformation}
    });

     // Escucha el evento de cierre del modal y actualiza la lista de usuarios si se editó un usuario
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllUserByAdministrator();
      }
    }) 
  }

  deleteUser(userId: number): void {
    this.userService.deleteUser(userId).subscribe({ // Llama al servicio para eliminar el usuario y muestra un mensaje de confirmación o  de error
      next: (response) => {
        this._snackBar.open(response.message, 'Cerrar', { duration: 5000 });
        this.getAllUserByAdministrator(); // Actualiza la lista de usuarios
      },
      error: (error) => {
        const errorMessage = error.error?.message || 'Error al eliminar el usuario';
        this._snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      }
    });
  }

}