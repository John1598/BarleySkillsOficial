import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <main class="flex-1 bg-white dark:bg-slate-900 py-16 transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <!-- Hero Section -->
        <div class="text-center mb-20">
          <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-6 tracking-tight">Sobre Nosotros</h1>
          <p class="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed">
            {{ configService.config().nombre_institucion }} es una institución educativa comprometida con la excelencia académica y la formación técnica profesional de nuestros jóvenes.
          </p>
        </div>

        <!-- Mission & Vision -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-12 mb-24">
          <div class="bg-indigo-50 dark:bg-indigo-900/20 rounded-3xl p-10 border border-indigo-100 dark:border-indigo-900/50 relative overflow-hidden group hover:shadow-xl dark:hover:shadow-indigo-900/30 transition-all duration-500">
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-indigo-200 dark:bg-indigo-800/30 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
            <mat-icon class="text-5xl text-indigo-600 dark:text-indigo-400 mb-6 relative z-10">flag</mat-icon>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4 relative z-10">Nuestra Misión</h2>
            <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed relative z-10">
              Formar técnicos profesionales competentes, éticos y emprendedores, capaces de integrarse exitosamente al mercado laboral y contribuir al desarrollo socioeconómico del país mediante una educación integral y de calidad.
            </p>
          </div>

          <div class="bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl p-10 border border-emerald-100 dark:border-emerald-900/50 relative overflow-hidden group hover:shadow-xl dark:hover:shadow-emerald-900/30 transition-all duration-500">
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-emerald-200 dark:bg-emerald-800/30 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-700"></div>
            <mat-icon class="text-5xl text-emerald-600 dark:text-emerald-400 mb-6 relative z-10">visibility</mat-icon>
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4 relative z-10">Nuestra Visión</h2>
            <p class="text-lg text-gray-700 dark:text-gray-300 leading-relaxed relative z-10">
              Ser la institución politécnica líder a nivel nacional, reconocida por la excelencia de sus egresados, la innovación en sus procesos educativos y su fuerte vinculación con el sector productivo y tecnológico.
            </p>
          </div>
        </div>

        <!-- Values -->
        <div class="mb-24">
          <div class="text-center mb-12">
            <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">Valores Institucionales</h2>
            <p class="text-lg text-gray-600 dark:text-gray-400">Los principios que guían nuestro actuar diario.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="text-center p-6">
              <div class="w-20 h-20 mx-auto bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center mb-6 transition-colors duration-200">
                <mat-icon class="text-4xl">verified</mat-icon>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Excelencia</h3>
              <p class="text-gray-600 dark:text-gray-400">Buscamos la mejora continua en todos nuestros procesos educativos.</p>
            </div>
            <div class="text-center p-6">
              <div class="w-20 h-20 mx-auto bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mb-6 transition-colors duration-200">
                <mat-icon class="text-4xl">handshake</mat-icon>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Responsabilidad</h3>
              <p class="text-gray-600 dark:text-gray-400">Cumplimos nuestros compromisos con la comunidad educativa.</p>
            </div>
            <div class="text-center p-6">
              <div class="w-20 h-20 mx-auto bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center mb-6 transition-colors duration-200">
                <mat-icon class="text-4xl">lightbulb</mat-icon>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Innovación</h3>
              <p class="text-gray-600 dark:text-gray-400">Fomentamos la creatividad y el uso de nuevas tecnologías.</p>
            </div>
            <div class="text-center p-6">
              <div class="w-20 h-20 mx-auto bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-full flex items-center justify-center mb-6 transition-colors duration-200">
                <mat-icon class="text-4xl">favorite</mat-icon>
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Empatía</h3>
              <p class="text-gray-600 dark:text-gray-400">Promovemos un ambiente de respeto, inclusión y apoyo mutuo.</p>
            </div>
          </div>
        </div>

        <!-- End Values -->
      </div>
    </main>
  `
})
export class AboutComponent {
  configService = inject(ConfigService);
}
