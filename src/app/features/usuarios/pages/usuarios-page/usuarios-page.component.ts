import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { CreateUserComponent } from '../../components/create-user/create-user.component';
import { ManageUsersComponent } from '../../components/manage-users/manage-users.component';
import { ChangePasswordComponent } from '../../components/change-password/change-password.component';

@Component({
    selector: 'app-usuarios-page',
    standalone: true,
    imports: [
        CommonModule,
        MatTabsModule,
        CreateUserComponent,
        ManageUsersComponent,
        ChangePasswordComponent
    ],
    templateUrl: './usuarios-page.component.html',
    styleUrls: ['./usuarios-page.component.scss']
})
export class UsuariosPageComponent { }
