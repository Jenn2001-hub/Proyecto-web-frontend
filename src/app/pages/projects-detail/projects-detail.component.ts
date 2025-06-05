import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder } from '@angular/forms';
import { ProjectsService } from 'app/services/projects/projects.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { ModalEditProjectsComponent } from '../modal-edit-projects/modal-edit-projects.component';

@Component({
  selector: 'app-projects-detail',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './projects-detail.component.html',
  styleUrl: './projects-detail.component.scss'
})
export class ProjectsDetailComponent {
  @Input() project: any;
  @Output() close = new EventEmitter<void>();

    constructor(
      private readonly _formBuilder: FormBuilder,
      private readonly projectService: ProjectsService,
      private readonly dialogModel: MatDialog,
      private readonly _snackBar: MatSnackBar
    ){}

 openEditModal(project: any): void {
    const dialogRef = this.dialogModel.open(ModalEditProjectsComponent, {
      width: '1200px',
      data: project
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        Object.assign(this.project, result);
      }
    });
  }
}