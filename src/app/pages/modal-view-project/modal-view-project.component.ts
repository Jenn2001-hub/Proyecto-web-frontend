import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { AddUsersModalComponent } from '../modal-add-users/modal-add-users.component'; // Asegúrate de crear este componente
import { ProjectsService } from 'app/services/projects/projects.service';

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
    private projectsService: ProjectsService
  ) { }

  closeDialog(): void {
    this.dialogRef.close();
  }

  saveChanges(): void {
    this.projectsService.updateProject(this.data.project.id, this.data.project)
      .subscribe({
        next: (response) => {
          console.log('Proyecto actualizado correctamente', response);
          this.dialogRef.close(true); // Emitir true para indicar que hubo cambios
        },
        error: (error) => {
          console.error('Error al actualizar el proyecto', error);
        }
      });
  }

  removeUser(userId: string): void {
    const projectId = this.data.project.id;
    this.projectsService.removeUserFromProject({
      project_id: projectId,
      usuario_id: userId
    }).subscribe({
      next: () => {
        // Solo actualizar la lista local después de confirmar el éxito en el backend
        this.data.project.usuarios = this.data.project.usuarios.filter((user: any) => user.id !== userId);
      },
      error: (error) => {
        console.error('Error al eliminar usuario', error);
      }
    });
  }

  openAddUsersDialog(): void {
    const dialogRef = this.dialog.open(AddUsersModalComponent, {
      width: '600px',
      data: { 
        currentUsers: this.data.project.usuarios,
        allUsers: [] // Aquí deberías pasar la lista completa de usuarios disponibles
      }
    });

    dialogRef.afterClosed().subscribe(selectedUsers => {
      if (selectedUsers && selectedUsers.length > 0) {
        const projectId = this.data.project.id;
        const adminId = this.data.project.administrador_id; // Asumiendo que tienes este campo
        
        this.projectsService.assingUsersToProject({
          project_id: projectId,
          usuario_id: selectedUsers.map((user: any) => user.id),
          administrador_id: [adminId] // O el ID del admin correspondiente
        }).subscribe({
          next: (response) => {
            // Actualizar la lista local con los nuevos usuarios
            const currentUserIds = this.data.project.usuarios.map((u: any) => u.id);
            const newUsers = selectedUsers.filter((user: any) => !currentUserIds.includes(user.id));
            this.data.project.usuarios = [...this.data.project.usuarios, ...newUsers];
          },
          error: (error) => {
            console.error('Error al agregar usuarios', error);
          }
        });
      }
    });
  }
}