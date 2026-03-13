import { Route } from '@angular/router';
import { MainLayoutComponent } from '../layout/app-layout/main-layout/main-layout.component';
import { AuthGuard } from '@core/guards/auth.guard';
import { RoleGuard } from '@core/guards/role.guard';
import { AuthLayoutComponent } from '../layout/app-layout/auth-layout/auth-layout.component';
import { LoginComponent } from '../features/auth/login/login.component';
import { RegisterComponent } from '../features/auth/register/register.component';
import { Page404Component } from '../features/auth/page404/page404.component';
import { Page500Component } from '../features/auth/page500/page500.component';
import { ForgotPasswordComponent } from '../features/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from '../features/auth/reset-password/reset-password.component';
import { LockedComponent } from '../features/auth/locked/locked.component';

export const APP_ROUTE: Route[] = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: '', redirectTo: 'orders', pathMatch: 'full' },
      {
        path: 'orders',
        loadChildren: () =>
          import('../features/orders/orders.routes').then((m) => m.ORDERS_ROUTE),
      },
    ],
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      { path: 'denied', component: Page404Component },
      { path: 'forgot-password', component: ForgotPasswordComponent },
      { path: 'reset-password', component: ResetPasswordComponent },
      { path: 'locked', component: LockedComponent },
      { path: 'page404', component: Page404Component },
      { path: 'page500', component: Page500Component },
    ],
  },
  { path: '**', component: Page404Component },
];
