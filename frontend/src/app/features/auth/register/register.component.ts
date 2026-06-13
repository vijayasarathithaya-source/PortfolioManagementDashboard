import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CardComponent } from '../../../shared/ui/card/card.component';
import { InputComponent } from '../../../shared/ui/input/input.component';
import { ButtonComponent } from '../../../shared/ui/button/button.component';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    CardComponent,
    InputComponent,
    ButtonComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  registerForm = new FormGroup(
    {
      fullName: new FormControl('', [Validators.required, Validators.minLength(2)]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
      confirmPassword: new FormControl('', [Validators.required]),
    },
    {
      validators: this.passwordMatchValidator,
    }
  );

  loading = signal(false);
  errorMessage = signal('');
  successMessage = signal('');

  constructor(private authService: AuthService, private router: Router) {}

  private passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      return { mismatch: true };
    }
    return null;
  }

  onSubmit(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');
    const { email, fullName, password } = this.registerForm.value;

    this.authService.register(email!, fullName!, password!).subscribe({
      next: () => {
        this.loading.set(false);
        this.successMessage.set('Registration successful! Please login.');
        setTimeout(() => this.router.navigate(['/auth/login']), 2000);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.error?.error || 'Registration failed');
      },
    });
  }
}
