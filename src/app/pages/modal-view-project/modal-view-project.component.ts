import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProjectsService } from 'app/services/projects/projects.service';
import { AddUsersModalComponent } from '../modal-add-users/modal-add-users.component';

@Component({
  selector: 'app-modal-view-project',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatDividerModule
  ],
  templateUrl: './modal-view-project.component.html',
  styleUrls: ['./modal-view-project.component.scss']
})
export class ModalViewProjectComponent {
  constructor(
    public dialogRef: MatDialogRef<ModalViewProjectComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialog: MatDialog,
    private projectsService: ProjectsService,
    private snackBar: MatSnackBar
  ) { }

  closeDialog(): void {
    this.dialogRef.close();
  }

  saveChanges(): void {
    this.projectsService.updateProject(this.data.project.id, this.data.project)
      .subscribe({
        next: (response) => {
          this.snackBar.open('Proyecto actualizado correctamente', 'Cerrar', {duration: 3000});
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.snackBar.open('Error al actualizar el proyecto', 'Cerrar', {duration: 3000});
          console.error('Error al actualizar el proyecto', error);
        }
      });
  }

  removeUser(userId: number): void {
    const projectId = this.data.project.id;
    this.projectsService.removeUserFromProject({
      project_id: projectId,
      usuario_id: userId
    }).subscribe({
      next: () => {
        this.data.project.usuarios = this.data.project.usuarios.filter((user: any) => user.id !== userId);
        this.snackBar.open('Usuario eliminado del proyecto', 'Cerrar', {duration: 3000});
      },
      error: (error) => {
        this.snackBar.open('Error al eliminar usuario del proyecto', 'Cerrar', {duration: 3000});
        console.error('Error al eliminar usuario', error);
      }
    });
  }

  openAddUsersDialog(): void {
    const dialogRef = this.dialog.open(AddUsersModalComponent, {
      width: '600px',
      data: { 
        currentUsers: this.data.project.usuarios
      }
    });

    dialogRef.afterClosed().subscribe(selectedUsers => {
      if (selectedUsers && selectedUsers.length > 0) {
        const projectId = this.data.project.id;
        this.projectsService.assingUsersToProject({
          project_id: projectId,
          usuario_ids: selectedUsers.map((user: any) => user.id)
        }).subscribe({
          next: () => {
            const currentUserIds = this.data.project.usuarios.map((u: any) => u.id);
            const newUsers = selectedUsers.filter((user: any) => !currentUserIds.includes(user.id));
            this.data.project.usuarios = [...this.data.project.usuarios, ...newUsers];
            this.snackBar.open('Usuarios agregados correctamente', 'Cerrar', {duration: 3000});
          },
          error: (error) => {
            this.snackBar.open('Error al agregar usuarios al proyecto', 'Cerrar', {duration: 3000});
            console.error('Error al agregar usuarios', error);
          }
        });
      }
    });
  }
}