import { Component, inject, computed, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ConfigService } from '../../services/config.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <main class="flex-1 bg-gray-50 dark:bg-slate-900 py-16 transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">Contáctanos</h1>
          <p class="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Estamos aquí para ayudarte. Ponte en contacto con la administración de {{ configService.config().nombre_institucion }}.
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <!-- Contact Info & Map -->
          <div class="space-y-8">
            <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-200">
              <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Información de Contacto</h2>
              <ul class="space-y-6">
                <li class="flex items-start gap-4">
                  <div class="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                    <mat-icon>location_on</mat-icon>
                  </div>
                  <div>
                    <h3 class="font-bold text-gray-900 dark:text-white">Dirección</h3>
                    <p class="text-gray-600 dark:text-gray-400">{{ configService.config().direccion || 'Av. Principal #123, Sector Los Ríos\\nSanto Domingo, República Dominicana' }}</p>
                  </div>
                </li>
                <li class="flex items-start gap-4">
                  <div class="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                    <mat-icon>phone</mat-icon>
                  </div>
                  <div>
                    <h3 class="font-bold text-gray-900 dark:text-white">Teléfono</h3>
                    <p class="text-gray-600 dark:text-gray-400">{{ configService.config().telefono || '+1 (809) 555-0123' }}</p>
                  </div>
                </li>
                <li class="flex items-start gap-4">
                  <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200">
                    <mat-icon>email</mat-icon>
                  </div>
                  <div>
                    <h3 class="font-bold text-gray-900 dark:text-white">Correo Electrónico</h3>
                    <p class="text-gray-600 dark:text-gray-400">{{ configService.config().correo || 'info@barleyskills.edu' }}</p>
                  </div>
                </li>
              </ul>
            </div>

            <div class="bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors duration-200">
              <!-- Google Maps iframe -->
              <iframe 
                [src]="safeMapUrl()" 
                width="100%" 
                height="300" 
                style="border:0;" 
                loading="lazy" 
                class="rounded-xl dark:opacity-80">
              </iframe>
            </div>
          </div>

          <!-- Contact Form -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-sm border border-gray-100 dark:border-slate-700 transition-colors duration-200">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">Envíanos un Mensaje</h2>
            <form class="space-y-6" (submit)="onSubmit($event)">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo</label>
                  <input type="text" id="name" required class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="Tu nombre">
                </div>
                <div>
                  <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
                  <input type="email" id="email" required class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="tu@correo.com">
                </div>
              </div>
              <div>
                <label for="subject" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asunto</label>
                <input type="text" id="subject" required class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors" placeholder="¿En qué podemos ayudarte?">
              </div>
              <div>
                <label for="message" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mensaje</label>
                <textarea id="message" rows="5" required class="w-full px-4 py-3 rounded-xl border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none" placeholder="Escribe tu mensaje aquí..."></textarea>
              </div>
              
              @if (showSuccess()) {
                <div class="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-4 rounded-xl flex items-center gap-3 border border-emerald-100 dark:border-emerald-800/50 transition-colors duration-200">
                  <mat-icon>check_circle</mat-icon>
                  <p>Mensaje enviado correctamente</p>
                </div>
              }
              
              @if (showError()) {
                <div class="bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 rounded-xl flex items-center gap-3 border border-red-100 dark:border-red-800/50 transition-colors duration-200">
                  <mat-icon>error_outline</mat-icon>
                  <p>{{ showError() }}</p>
                </div>
              }

              <button type="submit" [disabled]="loading()" class="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none">
                {{ loading() ? 'Enviando...' : 'Enviar Mensaje' }}
                @if (!loading()) {
                  <mat-icon>send</mat-icon>
                }
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  `
})
export class ContactComponent {
  configService = inject(ConfigService);
  sanitizer = inject(DomSanitizer);
  showSuccess = signal(false);
  showError = signal('');
  loading = signal(false);

  safeMapUrl = computed(() => {
    let url = this.configService.config().mapa_url || 'https://www.google.com/maps?q=18.5028948,-69.8716392&output=embed';
    if (!url.includes('output=embed')) {
      try {
        const parsed = new URL(url);
        if (parsed.hostname.includes('google.com') && parsed.pathname.includes('/maps')) {
          const q = parsed.searchParams.get('q');
          if (q) {
            url = `https://www.google.com/maps?q=${q}&output=embed`;
          } else {
             url += (url.includes('?') ? '&' : '?') + 'output=embed';
          }
        }
      } catch (e) {}
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  async onSubmit(event: Event) {
    event.preventDefault();
    this.showSuccess.set(false);
    this.showError.set('');
    this.loading.set(true);

    const form = event.target as HTMLFormElement;
    const nameInput = form.querySelector('#name') as HTMLInputElement;
    const emailInput = form.querySelector('#email') as HTMLInputElement;
    const subjectInput = form.querySelector('#subject') as HTMLInputElement;
    const messageInput = form.querySelector('#message') as HTMLTextAreaElement;

    const nombre = nameInput?.value;
    const correo = emailInput?.value;
    const asunto = subjectInput?.value;
    const mensaje = messageInput?.value;

    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, correo, asunto, mensaje })
      });
      const data = await res.json();
      
      if (res.ok) {
        this.showSuccess.set(true);
        form.reset();
        setTimeout(() => {
          this.showSuccess.set(false);
        }, 5000);
      } else {
        this.showError.set(data.error || 'Error al enviar el mensaje');
      }
    } catch (err) {
      this.showError.set('Error de conexión. Inténtalo de nuevo más tarde.');
    } finally {
      this.loading.set(false);
    }
  }
}
