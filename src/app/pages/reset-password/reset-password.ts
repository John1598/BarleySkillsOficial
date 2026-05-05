import { Component, inject, signal, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [RouterLink, MatIconModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200 dark:bg-slate-900">
      <div class="sm:mx-auto sm:w-full sm:max-w-md">
        <div class="flex justify-center">
          <mat-icon class="text-emerald-500 w-12 h-12 text-5xl">key</mat-icon>
        </div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight dark:text-white">
          Nueva Contraseña
        </h2>
      </div>

      <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div class="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-100 dark:bg-slate-800 dark:border-slate-700 transition-colors duration-200">
          
          @if (showSuccess()) {
            <div class="mb-6 bg-emerald-50 text-emerald-800 p-4 rounded-lg flex items-start gap-3 border border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800/50 text-center flex-col items-center">
              <mat-icon class="text-emerald-500 text-4xl w-10 h-10 mb-2">check_circle</mat-icon>
              <div>
                <h3 class="font-bold text-lg mb-2">¡Contraseña Actualizada!</h3>
                <p class="text-sm mb-4">Tu contraseña ha sido cambiada de forma exitosa.</p>
                <a routerLink="/login" class="inline-block px-4 py-2 bg-emerald-600 text-white rounded font-medium hover:bg-emerald-700 transition">Ir a iniciar sesión</a>
              </div>
            </div>
          } @else {
            <form class="space-y-6" [formGroup]="resetForm" (ngSubmit)="onSubmit()">
              <div>
                <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Nueva Contraseña
                </label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <mat-icon class="h-5 w-5 text-gray-400">lock</mat-icon>
                  </div>
                  <input id="password" type="password" formControlName="password" class="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400 transition-colors" placeholder="••••••••">
                </div>
                @if (resetForm.get('password')?.invalid && resetForm.get('password')?.touched) {
                  <p class="mt-2 text-sm text-rose-600 dark:text-rose-400">Debe tener al menos 8 caracteres</p>
                }
              </div>

              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Confirmar Contraseña
                </label>
                <div class="mt-1 relative rounded-md shadow-sm">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <mat-icon class="h-5 w-5 text-gray-400">lock_outline</mat-icon>
                  </div>
                  <input id="confirmPassword" type="password" formControlName="confirmPassword" class="focus:ring-emerald-500 focus:border-emerald-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md py-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400 transition-colors" placeholder="••••••••">
                </div>
                @if (resetForm.hasError('mismatch') && resetForm.get('confirmPassword')?.touched) {
                  <p class="mt-2 text-sm text-rose-600 dark:text-rose-400">Las contraseñas no coinciden</p>
                }
              </div>

              @if (showError()) {
                <div class="bg-rose-50 text-rose-800 p-3 rounded-lg text-sm border border-rose-200 dark:bg-rose-900/30 dark:text-rose-400 dark:border-rose-800/50 flex flex-row items-center gap-2">
                  <mat-icon class="w-5 h-5 text-[20px]">error</mat-icon>
                  <span>{{ showError() }}</span>
                </div>
              }

              <div>
                <button type="submit" [disabled]="resetForm.invalid || loading()" class="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all uppercase tracking-wider relative overflow-hidden group">
                  @if (loading()) {
                    <mat-icon class="animate-spin w-5 h-5 mr-3">refresh</mat-icon> Actualizando...
                  } @else {
                    Cambiar Contraseña
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
export class ResetPasswordComponent implements OnInit {
  private http = inject(HttpClient);
  public configService = inject(ConfigService);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);

  resetForm = this.fb.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  loading = signal(false);
  showSuccess = signal(false);
  showError = signal('');
  token = '';

  passwordMatchValidator(g: any) {
    return g.get('password').value === g.get('confirmPassword').value
      ? null : { mismatch: true };
  }

  ngOnInit() {
    this.token = this.route.snapshot.paramMap.get('token') || '';
  }

  onSubmit() {
    if (this.resetForm.valid && this.token) {
      this.loading.set(true);
      this.showError.set('');
      
      this.http.post<{success: boolean, message: string}>(`/api/reset-password/${this.token}`, { 
        newPassword: this.resetForm.value.password 
      }).subscribe({
          next: () => {
            this.loading.set(false);
            this.showSuccess.set(true);
          },
          error: (err) => {
            this.loading.set(false);
            this.showError.set(err.error?.error || 'No se pudo actualizar la contraseña (enlace inválido o expirado)');
          }
        });
    }
  }
}
