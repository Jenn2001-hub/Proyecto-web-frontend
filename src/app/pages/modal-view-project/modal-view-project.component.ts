import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { AddUsersModalComponent } from '../add-users-modal/add-users-modal.component'; // Asegúrate de crear este componente

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
    private dialog: MatDialog
  ) { }

  closeDialog(): void {
    this.dialogRef.close();
  }

  saveChanges(): void {
    // Lógica para guardar cambios
    this.dialogRef.close(this.data.project);
  }

  removeUser(userId: string): void {
    this.data.project.usuarios = this.data.project.usuarios.filter((user: any) => user.id !== userId);
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
      if (selectedUsers) {
        // Fusionar usuarios evitando duplicados
        const currentUserIds = this.data.project.usuarios.map((u: any) => u.id);
        const newUsers = selectedUsers.filter((user: any) => !currentUserIds.includes(user.id));
        this.data.project.usuarios = [...this.data.project.usuarios, ...newUsers];
      }
    });
  }
}