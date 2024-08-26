import { Component, inject } from '@angular/core';
import { FirebaseError } from '@angular/fire/app';
import { Auth, createUserWithEmailAndPassword, AuthErrorCodes } from '@angular/fire/auth';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterModule } from '@angular/router';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'qn-register',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  signupForm = new FormGroup({
    // name: new FormControl(),
    email: new FormControl(),
    password: new FormControl()
  })
  private snackBar = inject(MatSnackBar);

  constructor(
    private auth: Auth, 
  ) {}

  async signUp() {
    const formValue = this.signupForm.value;

    try {
      const response = await createUserWithEmailAndPassword(this.auth, formValue.email, formValue.password);
      console.log(response)
    } catch (error) {
      if (error instanceof FirebaseError) {
        console.log('firebase error', error);
        if (error.code == AuthErrorCodes.EMAIL_EXISTS) {
          this.snackBar.open("Email already used!");
        }
      } else {
        console.log('Error', error)
      }
    }
  }
}
