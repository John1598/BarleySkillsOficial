import { Component, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatIconModule],
  template: `
    <main class="flex-1 bg-gray-50 dark:bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div class="max-w-md w-full space-y-8 bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 transition-colors duration-200">
        <div>
          <div class="flex justify-center">
            <div class="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center">
              <mat-icon class="text-4xl w-10 h-10">school</mat-icon>
            </div>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Iniciar Sesión
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            O
            <a routerLink="/register" class="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors">
              crea una cuenta nueva
            </a>
          </p>
        </div>
        
        <form class="mt-8 space-y-6" [formGroup]="loginForm" (ngSubmit)="onSubmit()">
          <div class="rounded-md shadow-sm space-y-4">
            <div>
              <label for="email-address" class="sr-only">Correo electrónico</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <mat-icon class="text-gray-400 text-[20px] w-[20px] h-[20px]">email</mat-icon>
                </div>
                <input id="email-address" formControlName="email" type="email" autocomplete="email" required class="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors" placeholder="Correo electrónico">
              </div>
            </div>
            <div>
              <label for="password" class="sr-only">Contraseña</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <mat-icon class="text-gray-400 text-[20px] w-[20px] h-[20px]">lock</mat-icon>
                </div>
                <input id="password" formControlName="password" type="password" autocomplete="current-password" required class="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm transition-colors" placeholder="Contraseña">
              </div>
            </div>
          </div>
          
          <div class="flex items-center justify-center mt-2">
            <div class="text-sm">
              <a routerLink="/forgot-password" class="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400 dark:hover:text-emerald-300 transition-colors">
                ¿Olvidaste tu contraseña?
              </a>
            </div>
          </div>

          @if (errorMsg) {
            <div class="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
              <mat-icon class="text-red-500 dark:text-red-400">error</mat-icon>
              <p class="text-sm text-red-700 dark:text-red-300">{{ errorMsg }}</p>
            </div>
          }

          <div>
            <button type="submit" [disabled]="loginForm.invalid" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md">
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <mat-icon class="h-5 w-5 text-indigo-500 group-hover:text-indigo-400 transition-colors">login</mat-icon>
              </span>
              Ingresar
            </button>
          </div>
        </form>
      </div>
    </main>
  `
})
export class LoginComponent {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  errorMsg = '';

  async onSubmit() {
    if (this.loginForm.valid) {
      const { email, password } = this.loginForm.value;
      if (await this.auth.login(email!, password!)) {
        const user = this.auth.currentUser();
        if (user?.role === 'admin' || user?.role === 'super_admin') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      } else {
        this.errorMsg = 'Credenciales inválidas. Intente nuevamente.';
      }
    }
  }
}
