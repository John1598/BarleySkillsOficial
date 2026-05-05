import {Routes, CanActivateFn, Router} from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from './services/auth.service';
import { HomeComponent } from './pages/home/home';
import { AboutComponent } from './pages/about/about';
import { CoursesComponent } from './pages/courses/courses';
import { CourseDetailComponent } from './pages/course-detail/course-detail';
import { ContactComponent } from './pages/contact/contact';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { DashboardComponent } from './pages/dashboard/dashboard';
import { AdminComponent } from './pages/admin/admin';
import { VerifyComponent } from './pages/verify/verify';

import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password';
import { ResetPasswordComponent } from './pages/reset-password/reset-password';

const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser();
  
  if (!user) {
    return router.createUrlTree(['/login']);
  }
  
  if (user.role === 'admin' || user.role === 'super_admin') {
    return router.createUrlTree(['/admin']);
  }
  
  return true;
};

const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser();
  
  if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
    return router.createUrlTree(['/']);
  }
  
  return true;
};

const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const user = auth.currentUser();
  
  if (user) {
    if (user.role === 'admin' || user.role === 'super_admin') {
      return router.createUrlTree(['/admin']);
    } else {
      return router.createUrlTree(['/dashboard']);
    }
  }
  
  return true;
};

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'courses', component: CoursesComponent },
  { path: 'courses/:id', component: CourseDetailComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [guestGuard] },
  { path: 'reset-password/:token', component: ResetPasswordComponent, canActivate: [guestGuard] },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'admin', component: AdminComponent, canActivate: [adminGuard] },
  { path: 'verificar-certificado/:codigo', component: VerifyComponent },
  { path: '**', redirectTo: '' }
];
