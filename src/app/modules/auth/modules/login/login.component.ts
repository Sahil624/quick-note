import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth, signInWithEmailAndPassword, AuthError, AuthErrorCodes } from '@angular/fire/auth';
import { FirebaseError } from '@angular/fire/app';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'qn-login',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatCardModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm = new FormGroup({
    email: new FormControl(),
    password: new FormControl()
  })
  private snackBar = inject(MatSnackBar);

  constructor(private auth: Auth, private router: Router) {

  }


  async login() {
    const value = this.loginForm.value;
    try {
      const creds = await signInWithEmailAndPassword(this.auth, value.email, value.password);
      this.snackBar.open("Logged in!");
      this.router.navigateByUrl('/app');
    } catch (e) {
      if (e instanceof FirebaseError) {
        if (e.code == AuthErrorCodes.INVALID_LOGIN_CREDENTIALS) {
          this.snackBar.open("Invalid Credentials!");
        } else {
          console.log('firebase error', e)
        }
      } else {
        console.log('Something went wrong', e);
      }
    }
  }
}
