import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthGuard } from './guard/auth.guard';
import { AuthService } from './service/auth.service';
import { AdminGuard } from './guard/admin.guard';

@NgModule({
  declarations: [], // No declara componentes en este caso
  imports: [CommonModule], // Importa módulos comunes de Angular
  providers: [ // Provee servicios y guards a nivel de módulo
    AuthGuard,    // Guard para rutas que requieren autenticación
    AdminGuard,   // Guard para rutas que requieren rol admin
    AuthService,  // Servicio de autenticación
  ],
})
export class CoreModule { }
