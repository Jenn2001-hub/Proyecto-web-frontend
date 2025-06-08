import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { 
  MAT_DIALOG_DATA, 
  MatDialogRef, 
  MatDialogModule 
} from '@angular/material/dialog';
import { 
  MatListModule, 
  MatSelectionList 
} from '@angular/material/list';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { UsersService } from '../../services/users/users.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-add-users-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatListModule,
    MatButtonModule,
    MatInputModule,
    MatFormFieldModule,
    MatIconModule,
    FormsModule,
    MatProgressSpinnerModule,
    MatSelectionList
  ],
  templateUrl: './modal-add-users.component.html',
  styleUrls: ['./modal-add-users.component.scss']
})
export class AddUsersModalComponent implements OnInit {
  searchTerm = '';
  allUsers: any[] = [];
  filteredUsers: any[] = [];
  selectedUsers: any[] = []; // Añade esta línea
  isLoading = true;

  constructor(
    public dialogRef: MatDialogRef<AddUsersModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private usersService: UsersService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadAvailableUsers();
  }

  loadAvailableUsers(): void {
    this.usersService.getAllUsers().subscribe({
      next: (res: any) => {
        this.allUsers = res.users || res;
        if (this.data.currentUsers) {
          const currentUserIds = this.data.currentUsers.map((user: any) => user.id);
          this.allUsers = this.allUsers.filter(user => !currentUserIds.includes(user.id));
        }
        this.filteredUsers = [...this.allUsers];
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        this.snackBar.open('Error al cargar usuarios', 'Cerrar', { duration: 3000 });
      }
    });
  }

  filterUsers(): void {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.allUsers];
      return;
    }
    
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.allUsers.filter(user => 
      user.nombre.toLowerCase().includes(term) || 
      user.email.toLowerCase().includes(term)
    );
  }

  // Añade estos métodos nuevos
  isUserSelected(user: any): boolean {
    return this.selectedUsers.some(u => u.id === user.id);
  }

  toggleUserSelection(user: any): void {
    const index = this.selectedUsers.findIndex(u => u.id === user.id);
    if (index === -1) {
      this.selectedUsers.push(user);
    } else {
      this.selectedUsers.splice(index, 1);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // Actualiza este método
  onAddUsers(): void {
    this.dialogRef.close(this.selectedUsers);
  }
}