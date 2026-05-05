import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { ConfigService } from '../../services/config.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <footer class="bg-gray-900 text-gray-300 py-12 border-t border-gray-800">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-8">
          <!-- Brand -->
          <div class="col-span-1 md:col-span-1">
            <a routerLink="/" class="flex items-center gap-2 mb-4">
              @if (configService.config().logo) {
                <img [src]="configService.config().logo" alt="Logo" class="h-8 w-8 object-contain">
              } @else {
                <mat-icon class="text-emerald-500">school</mat-icon>
              }
              <span class="font-bold text-xl text-white tracking-tight">{{ configService.config().nombre_institucion || 'Barley Skills' }}</span>
            </a>
            <p class="text-sm text-gray-400 mb-4 whitespace-pre-line">
              {{ configService.config().descripcion || 'Plataforma de estudio virtual. Formando técnicos profesionales para el futuro.' }}
            </p>
          </div>

          <!-- Links -->
          <div>
            <h3 class="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Enlaces Rápidos</h3>
            <ul class="space-y-2 text-sm">
              <li><a routerLink="/" class="hover:text-emerald-400 transition-colors">Inicio</a></li>
              <li><a routerLink="/about" class="hover:text-emerald-400 transition-colors">Sobre Nosotros</a></li>
              <li><a routerLink="/courses" class="hover:text-emerald-400 transition-colors">Cursos Técnicos</a></li>
              <li><a routerLink="/contact" class="hover:text-emerald-400 transition-colors">Contacto</a></li>
            </ul>
          </div>

          <!-- Contact -->
          <div>
            <h3 class="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Contacto</h3>
            <ul class="space-y-2 text-sm text-gray-400">
              <li class="flex items-center gap-2"><mat-icon class="text-[18px] w-[18px] h-[18px]">location_on</mat-icon> {{ configService.config().direccion || 'Av. Principal #123, Ciudad' }}</li>
              <li class="flex items-center gap-2"><mat-icon class="text-[18px] w-[18px] h-[18px]">phone</mat-icon> {{ configService.config().telefono || '+1 (809) 555-0123' }}</li>
              <li class="flex items-center gap-2"><mat-icon class="text-[18px] w-[18px] h-[18px]">email</mat-icon> {{ configService.config().correo || 'info@barleyskills.edu' }}</li>
            </ul>
          </div>

          <!-- Social -->
          <div>
            <h3 class="text-white font-semibold mb-4 uppercase tracking-wider text-sm">Síguenos</h3>
            <div class="flex space-x-4">
              @if (configService.config().x) {
                <a [href]="configService.config().x" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 hover:text-white transition-colors">
                  <i class="fa-brands fa-x-twitter"></i>
                </a>
              }
              @if (configService.config().instagram) {
                <a [href]="configService.config().instagram" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors">
                  <i class="fa-brands fa-instagram"></i>
                </a>
              }
              @if (configService.config().tiktok) {
                <a [href]="configService.config().tiktok" target="_blank" rel="noopener noreferrer" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-black text-white hover:text-white transition-colors border border-gray-700">
                  <i class="fa-brands fa-tiktok"></i>
                </a>
              }
              
              <!-- Provide defaults if nothing is set to avoid empty space if none are saved initially -->
              @if (!configService.config().x && !configService.config().instagram && !configService.config().tiktok) {
                 <a href="https://x.com" target="_blank" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 hover:text-white transition-colors">
                  <i class="fa-brands fa-x-twitter"></i>
                 </a>
                 <a href="https://instagram.com" target="_blank" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors">
                   <i class="fa-brands fa-instagram"></i>
                 </a>
                 <a href="https://tiktok.com" target="_blank" class="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-black text-white hover:text-white transition-colors border border-gray-700">
                   <i class="fa-brands fa-tiktok"></i>
                 </a>
              }
            </div>
          </div>
        </div>
        
        <div class="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p class="text-sm text-gray-500">
            {{ configService.config().copyright || '© ' + currentYear + ' ' + (configService.config().nombre_institucion || 'Instituto') + ' - Todos los derechos reservados' }}
          </p>
          <div class="flex space-x-4 mt-4 md:mt-0 text-sm text-gray-500">
            <a href="#" class="hover:text-white">Términos</a>
            <a href="#" class="hover:text-white">Privacidad</a>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  configService = inject(ConfigService);
  currentYear = new Date().getFullYear();
}
