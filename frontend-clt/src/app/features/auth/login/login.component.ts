import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from '@core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { NgxTurnstileModule, NgxTurnstileFormsModule } from 'ngx-turnstile';
import { environment } from '@environment/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    RouterLink,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    NgxTurnstileModule,
    NgxTurnstileFormsModule,
  ],
})
export class LoginComponent implements OnInit {
  authForm!: UntypedFormGroup;
  submitted = false;
  loading = false;
  error = '';
  hide = true;
  rememberMe = false;

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
      username: ['', Validators.required],
      password: ['', Validators.required],
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
    this.loading = true;
    this.submitted = true;
    this.error = '';
    if (this.authForm.invalid) {
      this.error = 'Usuario y contraseña no válidos';
      this.loading = false;
      return;
    }
    const token = this.showTurnstile ? (this.f['turnstileToken']?.value || undefined) : undefined;
    this.authService.login(this.f['username'].value, this.f['password'].value, token).subscribe({
      next: (response) => {
        this.loading = false;
        const hasStoredToken = !!this.authService.getAccessToken();
        const hasResponse = response != null && !!response.accessToken;
        if (hasResponse || hasStoredToken) {
          setTimeout(() => this.router.navigateByUrl('/'), 0);
        } else {
          this.error = 'Usuario o contraseña incorrecta';
        }
      },
      error: () => {
        this.loading = false;
        this.error = 'Usuario o contraseña incorrecta';
        this.submitted = false;
      },
    });
  }
}
