import { Component, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [RouterLink, MatIconModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200 dark:bg-slate-900">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="flex justify-center">
          <mat-icon class="text-emerald-500 w-12 h-12 text-5xl">lock_reset</mat-icon>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight dark:text-white">
          Recuperar Contraseña
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Enlace a <a routerLink="/login" class="font-medium text-emerald-600 hover:text-emerald-500 transition-colors">iniciar sesión</a>
        </p>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-100 dark:bg-slate-800 dark:border-slate-700 transition-colors duration-200">
          
          @if (showSuccess()) {
            <div class="mb-6 bg-emerald-50 text-emerald-800 p-4 rounded-lg flex items-start gap-3 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50">
              <mat-icon class="text-emerald-500">check_circle</mat-icon>
              <div>
                <h3 class="font-semibold">¡Correo enviado!</h3>
                <p class="text-sm mt-1">Revisa tu bandeja de entrada o spam. Hemos enviado un enlace para restablecer tu contraseña.</p>
              </div>
            </div>
          } @else {
            <form class="space-y-6" [formGroup]="forgotForm" (ngSubmit)="onSubmit()">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Correo Electrónico
                </label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <mat-icon class="h-5 w-5 text-gray-400">email</mat-icon>
                  </div>
                  <input id="email" type="email" formControlName="email" class="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400 transition-colors" placeholder="tu@correo.com">
                </div>
                @if (forgotForm.get('email')?.invalid && forgotForm.get('email')?.touched) {
                  <p class="mt-2 text-sm text-rose-600 dark:text-rose-400">Correo electrónico válido requerido</p>
                }
              </div>

              @if (showError()) {
                <div class="bg-rose-50 text-rose-800 p-3 rounded-lg text-sm border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50 flex flex-row items-center gap-2">
                  <mat-icon class="w-5 h-5 text-[20px]">error</mat-icon>
                  <span>{{ showError() }}</span>
                </div>
              }

              <div>
                <button type="submit" [disabled]="forgotForm.invalid || loading()" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider relative overflow-hidden group">
                  @if (loading()) {
                    <mat-icon class="animate-spin w-5 h-5 mr-3">refresh</mat-icon> Enviando...
                  } @else {
                    Reenviar Enlace
                  }
                </button>
              </div>
            </form>
          }

        </div>
      </div>
    </div>
  `
})
export class ForgotPasswordComponent {
  private http = inject(HttpClient);
  public configService = inject(ConfigService);
  private fb = inject(FormBuilder);

  forgotForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]]
  });

  loading = signal(false);
  showSuccess = signal(false);
  showError = signal('');

  onSubmit() {
    if (this.forgotForm.valid) {
      this.loading.set(true);
      this.showError.set('');
      
      this.http.post<{success: boolean, message: string}>('/api/recuperar-password', { email: this.forgotForm.value.email })
        .subscribe({
          next: () => {
            this.loading.set(false);
            this.showSuccess.set(true);
          },
          error: (err) => {
            this.loading.set(false);
            this.showError.set(err.error?.error || 'Ha ocurrido un error inesperado');
          }
        });
    }
  }
}
