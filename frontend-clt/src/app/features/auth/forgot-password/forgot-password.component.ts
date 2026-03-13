import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxTurnstileModule, NgxTurnstileFormsModule } from 'ngx-turnstile';
import { environment } from '@environment/environment';
import { AuthService } from '@core';
import { getErrorMessage } from '@shared/models/api-error.model';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    RouterLink,
    NgxTurnstileModule,
    NgxTurnstileFormsModule,
  ],
})
export class ForgotPasswordComponent implements OnInit {
  authForm!: UntypedFormGroup;
  submitted = false;
  loading = false;
  success = false;
  error = '';

  /** Turnstile siempre visible (demo/producción con site key de prueba). */
  readonly showTurnstile = true;
  readonly turnstileSiteKey = environment.turnstileSiteKey;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const controls: Record<string, unknown> = {
      email: ['', [Validators.required, Validators.email, Validators.minLength(5)]],
    };
    if (this.showTurnstile) {
      controls['turnstileToken'] = ['', Validators.required];
    }
    this.authForm = this.formBuilder.group(controls);
  }

  get f() {
    return this.authForm.controls;
  }

  onSubmit() {
    this.submitted = true;
    this.error = '';
    if (this.authForm.invalid) return;

    this.loading = true;
    const email = this.authForm.get('email')?.value;
    this.authService.forgotPassword(email).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
      },
      error: (err) => {
        this.loading = false;
        this.error = getErrorMessage(err, 'Error al procesar la solicitud. Intenta de nuevo.');
      },
    });
  }
}
