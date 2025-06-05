// Importaciones para rutas del dashboard
import { Route } from '@angular/router';
import { MainComponent } from './main/main.component';


export const DASHBOARD_ROUTE: Route[] = [
  {
    path: 'main', // Ruta principal del dashboard
    component: MainComponent // Componente contenedor principal
  },
];

