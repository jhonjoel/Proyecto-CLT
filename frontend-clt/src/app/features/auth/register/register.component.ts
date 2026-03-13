import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
  ValidatorFn,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '@core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxTurnstileModule, NgxTurnstileFormsModule } from 'ngx-turnstile';
import { environment } from '@environment/environment';
import { getErrorMessage } from '@shared/models/api-error.model';

function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent;
    if (!parent) return null;
    const password = parent.get('password')?.value;
    const confirm = control.value;
    return password && confirm && password !== confirm ? { passwordMismatch: true } : null;
  };
}

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    RouterLink,
    MatButtonModule,
    NgxTurnstileModule,
    NgxTurnstileFormsModule,
  ],
})
export class RegisterComponent implements OnInit {
  authForm!: UntypedFormGroup;
  submitted = false;
  loading = false;
  error = '';
  hide = true;
  chide = true;

  /** Turnstile solo en desarrollo/pruebas; en producción no se muestra. */
  readonly showTurnstile = !environment.production;
  readonly turnstileSiteKey = environment.turnstileSiteKey;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const controls: Record<string, unknown> = {
      nombre: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, passwordMatchValidator()]],
    };
    if (this.showTurnstile) {
      controls['turnstileToken'] = ['', Validators.required];
    }
    this.authForm = this.formBuilder.group(controls, { validators: [] });
  }

  get f() {
    return this.authForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';
    if (this.authForm.invalid) return;

    this.loading = true;
    const { nombre, email, password } = this.authForm.value;
    const turnstileToken = this.showTurnstile ? (this.f['turnstileToken']?.value || undefined) : undefined;
    this.authService
      .register({
        nombre: nombre.trim(),
        email: email.trim(),
        password,
        turnstileToken,
      })
      .subscribe({
        next: (response) => {
          this.loading = false;
          if (response) {
            this.router.navigateByUrl('/');
          } else {
            this.error = 'Error al registrar. Intenta de nuevo.';
          }
        },
        error: (err) => {
          this.loading = false;
          this.error = getErrorMessage(err, 'Error al registrar la cuenta.');
        },
      });
  }
}
