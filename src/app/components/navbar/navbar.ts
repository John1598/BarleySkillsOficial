import { Component, inject, signal, effect } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, MatIconModule],
  template: `
    <nav class="bg-indigo-900 dark:bg-slate-900 text-white shadow-lg sticky top-0 z-50 transition-colors duration-200 border-b border-transparent dark:border-slate-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <a routerLink="/" class="flex items-center gap-2">
              @if (configService.config().logo) {
                <img [src]="configService.config().logo" alt="Logo" class="h-8 object-contain" referrerpolicy="no-referrer">
              } @else {
                <mat-icon class="text-emerald-400">school</mat-icon>
              }
              <span class="font-bold text-xl tracking-tight">{{ configService.config().nombre_institucion || 'Barley Skills' }}</span>
            </a>
          </div>
          
          <!-- Desktop Menu -->
          <div class="hidden md:flex items-center space-x-4">
            <a routerLink="/" routerLinkActive="text-emerald-400" [routerLinkActiveOptions]="{exact: true}" class="hover:text-emerald-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">Inicio</a>
            <a routerLink="/about" routerLinkActive="text-emerald-400" class="hover:text-emerald-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">Sobre Nosotros</a>
            <a routerLink="/courses" routerLinkActive="text-emerald-400" class="hover:text-emerald-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">Cursos Técnicos</a>
            <a routerLink="/contact" routerLinkActive="text-emerald-400" class="hover:text-emerald-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">Contacto</a>
            
            <button (click)="toggleTheme()" class="p-2 rounded-full hover:bg-indigo-800 dark:hover:bg-slate-800 transition-colors text-gray-300 hover:text-white ml-2" [title]="isDarkMode() ? 'Modo Claro' : 'Modo Oscuro'">
              <mat-icon class="text-[20px] w-[20px] h-[20px]">{{ isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>

            @if (auth.currentUser()) {
              <div class="flex items-center gap-4 ml-4 pl-4 border-l border-indigo-700 dark:border-slate-700">
                <a [routerLink]="auth.currentUser()?.role === 'admin' ? '/admin' : '/dashboard'" class="flex items-center gap-2 hover:text-emerald-300 transition-colors">
                  <img [src]="auth.currentUser()?.photoUrl" alt="Profile" class="w-8 h-8 rounded-full border-2 border-emerald-400 object-cover">
                  <span class="text-sm font-medium">{{ auth.currentUser()?.name }}</span>
                </a>
                <button (click)="logout()" class="text-sm text-red-300 hover:text-red-400 flex items-center gap-1">
                  <mat-icon class="text-[18px] w-[18px] h-[18px]">logout</mat-icon>
                  Salir
                </button>
              </div>
            } @else {
              <div class="flex items-center gap-2 ml-4 pl-4 border-l border-indigo-700 dark:border-slate-700">
                <a routerLink="/login" class="text-white hover:text-emerald-300 px-3 py-2 rounded-md text-sm font-medium transition-colors">Ingresar</a>
                <a routerLink="/register" class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors">Registrarse</a>
              </div>
            }
          </div>

          <!-- Mobile menu button -->
          <div class="md:hidden flex items-center gap-2">
            <button (click)="toggleTheme()" class="p-2 rounded-full hover:bg-indigo-800 dark:hover:bg-slate-800 transition-colors text-gray-300 hover:text-white">
              <mat-icon class="text-[20px] w-[20px] h-[20px]">{{ isDarkMode() ? 'light_mode' : 'dark_mode' }}</mat-icon>
            </button>
            <button (click)="isMobileMenuOpen = !isMobileMenuOpen" class="text-gray-300 hover:text-white focus:outline-none">
              <mat-icon>{{ isMobileMenuOpen ? 'close' : 'menu' }}</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Mobile Menu -->
      @if (isMobileMenuOpen) {
        <div class="md:hidden bg-indigo-800 dark:bg-slate-800 pb-4 px-2 transition-colors duration-200">
          <a routerLink="/" (click)="isMobileMenuOpen = false" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700 dark:hover:bg-slate-700">Inicio</a>
          <a routerLink="/about" (click)="isMobileMenuOpen = false" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700 dark:hover:bg-slate-700">Sobre Nosotros</a>
          <a routerLink="/courses" (click)="isMobileMenuOpen = false" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700 dark:hover:bg-slate-700">Cursos Técnicos</a>
          <a routerLink="/contact" (click)="isMobileMenuOpen = false" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700 dark:hover:bg-slate-700">Contacto</a>
          
          <div class="border-t border-indigo-700 dark:border-slate-700 mt-2 pt-2">
            @if (auth.currentUser()) {
              <a [routerLink]="auth.currentUser()?.role === 'admin' ? '/admin' : '/dashboard'" (click)="isMobileMenuOpen = false" class="flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700 dark:hover:bg-slate-700">
                <img [src]="auth.currentUser()?.photoUrl" alt="Profile" class="w-8 h-8 rounded-full border-2 border-emerald-400 object-cover">
                <span>Mi Perfil ({{ auth.currentUser()?.name }})</span>
              </a>
              <button (click)="logout(); isMobileMenuOpen = false" class="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-300 hover:bg-indigo-700 dark:hover:bg-slate-700 flex items-center gap-2">
                <mat-icon>logout</mat-icon> Cerrar Sesión
              </button>
            } @else {
              <a routerLink="/login" (click)="isMobileMenuOpen = false" class="block px-3 py-2 rounded-md text-base font-medium hover:bg-indigo-700 dark:hover:bg-slate-700">Ingresar</a>
              <a routerLink="/register" (click)="isMobileMenuOpen = false" class="block px-3 py-2 rounded-md text-base font-medium text-emerald-400 hover:bg-indigo-700 dark:hover:bg-slate-700">Registrarse</a>
            }
          </div>
        </div>
      }
    </nav>
  `
})
export class NavbarComponent {
  auth = inject(AuthService);
  configService = inject(ConfigService);
  router = inject(Router);
  isMobileMenuOpen = false;
  isDarkMode = signal(false);

  constructor() {
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme === 'dark' || (!storedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      this.isDarkMode.set(true);
      document.documentElement.classList.add('dark');
    }

    effect(() => {
      if (this.isDarkMode()) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    });
  }

  toggleTheme() {
    this.isDarkMode.update(v => !v);
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }
}
