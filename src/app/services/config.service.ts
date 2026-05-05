import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface AppConfig {
  id?: number;
  nombre_institucion: string;
  logo: string;
  copyright?: string;
  descripcion?: string;
  direccion?: string;
  telefono?: string;
  correo?: string;
  x?: string;
  instagram?: string;
  tiktok?: string;
  mapa_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private http = inject(HttpClient);
  
  config = signal<AppConfig>({ 
    nombre_institucion: 'Barley Skills', 
    logo: '', 
    copyright: '© 2026 Barley Skills - Todos los derechos reservados',
    descripcion: 'Plataforma de estudio virtual. Formando técnicos profesionales para el futuro.',
    direccion: 'Avenida Siempre Viva 123',
    telefono: '+1 234 567 8900',
    correo: 'contacto@barleyskills.edu',
    x: '',
    instagram: '',
    tiktok: '',
    mapa_url: ''
  });

  constructor() {
    this.loadConfig();
  }

  loadConfig() {
    this.http.get<AppConfig>('/api/configuracion').subscribe({
      next: (data) => {
        this.config.set(data);
      },
      error: (err) => console.error('Error loading config:', err)
    });
  }

  updateConfig(newConfig: AppConfig) {
    this.http.put<AppConfig>('/api/configuracion', newConfig).subscribe({
      next: (updatedConfig) => {
        this.config.set(updatedConfig);
        console.log('Configuración guardada correctamente');
      },
      error: (err) => {
        console.error('Error updating config:', err);
      }
    });
  }
}
