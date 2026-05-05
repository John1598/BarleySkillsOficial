import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <main class="flex-1">
      <!-- Hero Section -->
      <section class="relative bg-indigo-900 dark:bg-slate-900 text-white overflow-hidden transition-colors duration-200">
        <div class="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1541339907198-e08756dedf3f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" alt="Students" class="w-full h-full object-cover opacity-20" referrerpolicy="no-referrer">
          <div class="absolute inset-0 bg-gradient-to-r from-indigo-900 dark:from-slate-900 to-transparent"></div>
        </div>
        <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div class="md:w-2/3">
            <h1 class="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Tu Futuro Profesional <br>
              <span class="text-emerald-400">Comienza Aquí</span>
            </h1>
            <p class="text-xl md:text-2xl text-indigo-100 dark:text-gray-300 mb-10 max-w-3xl">
              Plataforma virtual de {{ configService.config().nombre_institucion }}. Fórmate como técnico profesional con nuestros programas de estudio innovadores.
            </p>
            <div class="flex flex-col sm:flex-row gap-4">
              <a routerLink="/courses" class="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-4 rounded-lg font-bold text-lg transition-all shadow-lg hover:shadow-xl text-center">
                Explorar Cursos
              </a>
              @if (!auth.currentUser()) {
                <a routerLink="/register" class="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-lg font-bold text-lg transition-all text-center backdrop-blur-sm">
                  Inscribirse Ahora
                </a>
              } @else {
                <a routerLink="/dashboard" class="bg-white/10 hover:bg-white/20 text-white border border-white/30 px-8 py-4 rounded-lg font-bold text-lg transition-all text-center backdrop-blur-sm">
                  Ir a mi Panel
                </a>
              }
            </div>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-20 bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="text-center mb-16">
            <h2 class="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">¿Por qué estudiar con nosotros?</h2>
            <p class="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">Descubre las ventajas de nuestra plataforma virtual y cómo te preparamos para el mundo laboral.</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <!-- Feature 1 -->
            <div class="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all">
              <div class="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center mb-6">
                <mat-icon class="text-3xl w-8 h-8">psychology</mat-icon>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Competencias</h3>
              <p class="text-gray-600 dark:text-gray-400">Desarrolla habilidades técnicas y blandas altamente demandadas en el mercado actual.</p>
            </div>

            <!-- Feature 2 -->
            <div class="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all">
              <div class="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center mb-6">
                <mat-icon class="text-3xl w-8 h-8">school</mat-icon>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Perfil del Egresado</h3>
              <p class="text-gray-600 dark:text-gray-400">Gradúate como un profesional técnico capacitado, ético y listo para innovar.</p>
            </div>

            <!-- Feature 3 -->
            <div class="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all">
              <div class="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center mb-6">
                <mat-icon class="text-3xl w-8 h-8">work</mat-icon>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Perfil Profesional</h3>
              <p class="text-gray-600 dark:text-gray-400">Accede a oportunidades laborales de calidad con nuestra bolsa de empleo y convenios.</p>
            </div>

            <!-- Feature 4 -->
            <div class="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-md transition-all">
              <div class="w-14 h-14 bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center mb-6">
                <mat-icon class="text-3xl w-8 h-8">trending_up</mat-icon>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-3">Beneficios</h3>
              <p class="text-gray-600 dark:text-gray-400">Estudia a tu ritmo, accede a recursos exclusivos y obtén certificaciones avaladas.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-20 bg-indigo-600 dark:bg-indigo-800 text-white text-center transition-colors duration-200">
        <div class="max-w-4xl mx-auto px-4">
          <h2 class="text-3xl md:text-4xl font-bold mb-6">¿Listo para dar el siguiente paso?</h2>
          <p class="text-xl text-indigo-100 dark:text-indigo-200 mb-10">Únete a cientos de estudiantes que ya están construyendo su futuro en {{ configService.config().nombre_institucion }}.</p>
          @if (!auth.currentUser()) {
            <a routerLink="/register" class="inline-block bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 hover:bg-gray-50 dark:hover:bg-slate-800 px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg">
              Crear mi cuenta gratis
            </a>
          } @else {
            <a routerLink="/dashboard" class="inline-block bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 hover:bg-gray-50 dark:hover:bg-slate-800 px-8 py-4 rounded-lg font-bold text-lg transition-colors shadow-lg">
              Continuar aprendiendo
            </a>
          }
        </div>
      </section>
    </main>
  `
})
export class HomeComponent {
  auth = inject(AuthService);
  configService = inject(ConfigService);
}
