import { Component } from '@angular/core';

@Component({
  selector: 'app-main', // Selector para usar en templates
  templateUrl: './main.component.html', // Template asociado
  styleUrls: ['./main.component.scss'], // Estilos específicos
  standalone: true, // Componente auto-contenido (Angular 14+)
  imports: [], // Importaciones de otros componentes standalone
})
export class MainComponent {
  
  // Constructor simple sin lógica inicial
  constructor() { }
  
}
