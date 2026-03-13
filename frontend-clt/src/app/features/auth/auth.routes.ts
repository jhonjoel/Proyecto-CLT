import { Route } from '@angular/router';
import { SigninComponent } from '../../authentication/signin/signin.component';
import { SignupComponent } from '../../authentication/signup/signup.component';
import { ForgotPasswordComponent } from '../../authentication/forgot-password/forgot-password.component';
import { LockedComponent } from '../../authentication/locked/locked.component';
import { Page404Component } from '../../authentication/page404/page404.component';
import { Page500Component } from '../../authentication/page500/page500.component';

export const AUTH_ROUTE: Route[] = [
  { path: '', redirectTo: 'signin', pathMatch: 'full' },
  { path: 'signin', component: SigninComponent },
  { path: 'denied', component: Page404Component },
  { path: 'signup', component: SignupComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'locked', component: LockedComponent },
  { path: 'page404', component: Page404Component },
  { path: 'page500', component: Page500Component },
];
