import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { MatIconModule } from '@angular/material/icon';
import QRCode from 'qrcode';

@Component({
  selector: 'app-verify',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule],
  template: `
    <div class="min-h-screen bg-gray-100 dark:bg-slate-900 py-12 px-4 sm:px-6 flex flex-col items-center justify-center font-sans">
      
      <!-- Font Imports -->
      <style>
        .font-diploma-title { font-family: 'Playfair Display', serif; }
        .font-diploma-name { font-family: 'Great Vibes', cursive; }
        .font-diploma-body { font-family: 'Montserrat', sans-serif; }
        
        .diploma-bg {
          background-color: #fdfbf7;
          background-image: radial-gradient(#ecc94b22 1px, transparent 1px);
          background-size: 20px 20px;
        }

        /* Gold gradient for text and accents */
        .gold-gradient {
          background: linear-gradient(to right, #cf9116, #f2d06b, #cf9116);
          -webkit-background-clip: text;
          color: transparent;
        }
        
        .gold-bg {
          background: linear-gradient(135deg, #cf9116, #f2d06b, #8a5700);
        }
        
        .purple-dark { color: #2d0a4e; }
        .purple-m { color: #52009e; }
        
        .print-hide {
          @media print { display: none !important; }
        }
        
        @page {
          size: landscape;
          margin: 0;
        }
      </style>

      <div class="mb-8 print:hidden flex gap-4">
        <a routerLink="/" class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 transition-colors font-medium">
          <mat-icon>arrow_back</mat-icon> Volver al inicio
        </a>
      </div>

      @if (loading()) {
        <div class="flex flex-col items-center justify-center space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          <p class="text-gray-600 dark:text-gray-400">Cargando diploma...</p>
        </div>
      } @else if (error()) {
        <div class="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-red-500">
          <div class="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <mat-icon class="text-3xl">error_outline</mat-icon>
          </div>
          <h2 class="text-2xl font-bold text-gray-900 mb-2">Certificado Inválido</h2>
          <p class="text-gray-600 mb-6">{{ error() }}</p>
          <p class="text-sm text-gray-500">Asegúrate de que el código sea correcto.</p>
        </div>
      } @else if (certificate()) {
        
        <!-- Verification Badge (hidden on print) -->
        <div class="mb-6 bg-emerald-100 text-emerald-700 px-6 py-3 rounded-full flex items-center gap-3 shadow-md border border-emerald-200 print:hidden">
          <mat-icon>verified</mat-icon>
          <span class="font-bold tracking-wide">CERTIFICADO VÁLIDO</span>
        </div>

        <!-- Scrollable Wrapper for smaller screens -->
        <div class="w-full max-w-6xl overflow-x-auto pb-8 shadow-[0_20px_50px_rgba(0,0,0,0.3)] print:shadow-none print:pb-0 mx-auto">
          
          <!-- The Diploma Container (Fixed Aspect Ratio Desktop layout) -->
          <div class="diploma-bg relative mx-auto overflow-hidden font-diploma-body border-8 border-white box-content" 
               style="width: 1100px; height: 780px;">
            
            <!-- Outer Gold Frame -->
            <div class="absolute inset-x-3 inset-y-3 border-2 border-[#cf9116] rounded-sm pointer-events-none z-10">
              <!-- Corner Boxes -->
              <div class="absolute -top-1 -left-1 w-3 h-3 bg-white border-2 border-[#cf9116]"></div>
              <div class="absolute -top-1 -right-1 w-3 h-3 bg-white border-2 border-[#cf9116]"></div>
              <div class="absolute -bottom-1 -left-1 w-3 h-3 bg-white border-2 border-[#cf9116]"></div>
              <div class="absolute -bottom-1 -right-1 w-3 h-3 bg-white border-2 border-[#cf9116]"></div>
            </div>

            <!-- Geometric Shapes / Decor (Top Left) -->
            <div class="absolute top-0 left-0 w-[400px] h-[400px] z-0 pointer-events-none" style="clip-path: polygon(0 0, 100% 0, 0 100%); background-color: #2d0a4e;">
              <div class="absolute inset-0 bg-gradient-to-br from-[#451070] to-[#1a0530]"></div>
              <!-- Gold stripes -->
              <div class="absolute top-[80px] -left-[100px] w-[500px] h-[8px] bg-[#cf9116] rotate-[45deg]"></div>
              <div class="absolute top-[120px] -left-[100px] w-[500px] h-[3px] bg-[#f2d06b] rotate-[45deg]"></div>
            </div>
            
            <!-- Decor Bottom Left -->
            <div class="absolute bottom-0 left-0 w-[80px] h-[80px] z-0 pointer-events-none" style="clip-path: polygon(0 100%, 100% 100%, 0 0); background-color: #cf9116;"></div>

            <!-- Decor Bottom Right -->
            <div class="absolute bottom-0 right-0 w-[500px] h-[500px] z-0 pointer-events-none" style="clip-path: polygon(100% 0, 100% 100%, 0 100%);">
              <div class="absolute inset-0 bg-[#2d0a4e] bg-gradient-to-tl from-[#1a0530] to-[#451070]"></div>
              <div class="absolute bottom-[100px] right-[-100px] w-[600px] h-[10px] bg-[#cf9116] -rotate-[45deg]"></div>
              <div class="absolute bottom-[60px] right-[-100px] w-[600px] h-[2px] bg-[#f2d06b] -rotate-[45deg]"></div>
            </div>

            <!-- Top Right Ribbon -->
            <div class="absolute top-0 right-16 w-24 h-48 z-20 pointer-events-none flex flex-col items-center">
              <div class="w-16 h-full bg-[#1a0530] relative" style="clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 85%, 0 100%);"></div>
              <!-- Seal on ribbon -->
              <div class="absolute top-12 w-28 h-28 rounded-full gold-bg shadow-lg flex items-center justify-center p-1">
                <div class="w-full h-full rounded-full border border-[rgba(255,255,255,0.7)] flex flex-col items-center justify-center bg-[#2d0a4e] text-white">
                  <mat-icon style="font-size: 32px; width: 32px; height: 32px; color: #f2d06b;">school</mat-icon>
                  <div class="text-[8px] font-bold tracking-widest mt-1 text-[#f2d06b]">EXCELENCIA</div>
                </div>
              </div>
            </div>

            <!-- Main Content Area -->
            <div class="relative z-10 w-full h-full px-12 pt-16 pb-8 flex flex-col items-center text-center">
              
              <!-- Logo / Brand -->
              <div class="flex items-center gap-3 mb-6">
                <div class="w-12 h-12 bg-gradient-to-br from-[#451070] to-[#2d0a4e] rounded-lg rotate-12 flex items-center justify-center shadow-md">
                  <mat-icon class="text-white -rotate-12">school</mat-icon>
                </div>
                <div class="flex flex-col text-left">
                  <span class="text-3xl font-bold purple-dark tracking-tight leading-none bg-clip-text">Barley Skills</span>
                  <span class="text-[10px] font-semibold text-gray-500 tracking-[0.2em] uppercase mt-1">Plataforma de Educación Online</span>
                </div>
              </div>

              <!-- Title -->
              <h1 class="font-diploma-title text-[80px] font-black purple-dark leading-none tracking-wide mt-2 shadow-sm" style="text-shadow: 2px 2px 4px rgba(0,0,0,0.05);">DIPLOMA</h1>
              <h2 class="text-xl font-bold tracking-[0.4em] text-[#cf9116] mb-8 relative pr-[-0.4em]">
                DE FINALIZACIÓN
              </h2>

              <!-- Subtitle / Awarded to -->
              <div class="flex items-center justify-center gap-4 mb-4">
                <div class="h-px bg-[#cf9116] w-12"></div>
                <span class="text-sm font-bold tracking-widest text-[#2d0a4e] uppercase">— SE OTORGA A —</span>
                <div class="h-px bg-[#cf9116] w-12"></div>
              </div>

              <!-- Student Name -->
              <div class="font-diploma-name text-[85px] leading-none purple-dark mb-6 relative px-12 my-2" style="text-shadow: 1px 1px 2px rgba(0,0,0,0.1);">
                {{ certificate()?.usuario_nombre }}
                <!-- Underline decor -->
                <div class="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-[#cf9116] to-transparent"></div>
                <div class="absolute bottom-[-13px] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#cf9116] border border-white"></div>
              </div>

              <!-- Description -->
              <p class="text-lg text-gray-700 mb-2 mt-4 font-medium">Por haber completado satisfactoriamente el curso:</p>
              
              <!-- Course Name -->
              <h3 class="text-4xl font-bold text-[#7e22ce] mb-6">
                {{ certificate()?.curso_nombre }}
              </h3>

              <p class="text-[15px] text-gray-600 max-w-2xl px-8 leading-relaxed font-medium">
                Demostrando dedicación, esfuerzo y compromiso con su aprendizaje <br>
                en la plataforma <strong class="purple-dark">Barley Skills</strong>.
              </p>

              <!-- Bottom Data & Signatures (Moved closer to bottom) -->
              <div class="absolute bottom-20 left-0 right-0 px-24 flex justify-between items-end w-full">
                
                <!-- Info block (Date & ID) -->
                <div class="flex gap-16 mb-2">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-[#f0e7f6] text-[#7e22ce] flex items-center justify-center">
                      <mat-icon>calendar_today</mat-icon>
                    </div>
                    <div class="text-left">
                      <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-1">Fecha de finalización</p>
                      <p class="text-[15px] font-semibold text-gray-800">{{ certificate()?.fecha | date:'longDate' }}</p>
                    </div>
                  </div>

                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg bg-[#f9f1e1] text-[#cf9116] flex items-center justify-center">
                      <mat-icon>verified</mat-icon>
                    </div>
                    <div class="text-left">
                      <p class="text-[11px] uppercase tracking-wider text-gray-500 font-bold mb-1">Certificado ID</p>
                      <p class="text-[15px] font-semibold text-gray-800">{{ certificate()?.codigo_certificado }}</p>
                    </div>
                  </div>
                </div>

                <!-- Empty space for middle seal (placed below) -->
                <div class="w-32"></div>

              </div>

              <!-- Signatures & Core Seal row at the VERY bottom -->
              <div class="absolute bottom-4 left-0 right-0 px-20 flex justify-between items-end w-full pb-8">
                
                <!-- Left Signature -->
                <div class="text-center w-56">
                  <div class="h-16 border-b border-gray-400 mb-2 relative flex items-end justify-center pb-1">
                    <span class="font-diploma-name text-4xl text-gray-700 opacity-80" style="position: absolute; bottom: 5px;">Alexander H.</span>
                  </div>
                  <p class="text-[11px] uppercase tracking-wider font-bold text-gray-600">Director Académico</p>
                  <p class="text-[10px] text-gray-500 mt-1">Barley Skills</p>
                </div>

                <!-- Center Gold Seal -->
                <div class="absolute left-1/2 -translate-x-1/2 bottom-5">
                  <div class="w-28 h-28 rounded-full gold-bg flex items-center justify-center p-1 shadow-xl">
                     <div class="w-full h-full rounded-full border-2 border-[rgba(255,255,255,0.4)] border-dashed flex flex-col items-center justify-center bg-[#2d0a4e] text-white">
                        <span class="text-[8px] uppercase tracking-[0.2em] text-[#f2d06b] font-bold mb-1">Barley Skills</span>
                        <mat-icon style="font-size: 32px; width: 32px; height: 32px; color: #f2d06b;">school</mat-icon>
                        <div class="flex mt-1 gap-1">
                          <mat-icon style="font-size: 8px; width: 8px; height: 8px; color: #f2d06b;">star</mat-icon>
                          <mat-icon style="font-size: 10px; width: 10px; height: 10px; color: #f2d06b;">star</mat-icon>
                          <mat-icon style="font-size: 8px; width: 8px; height: 8px; color: #f2d06b;">star</mat-icon>
                        </div>
                     </div>
                  </div>
                </div>

                <!-- Right Signature -->
                <div class="text-center w-56 flex flex-col items-center">
                  <div class="h-16 border-b border-gray-400 mb-2 w-full relative flex items-end justify-center pb-1">
                    <span class="font-diploma-name text-4xl text-gray-700 opacity-80" style="position: absolute; bottom: 5px;">Marta L.</span>
                  </div>
                  <p class="text-[11px] uppercase tracking-wider font-bold text-gray-600">Coordinadora de Cursos</p>
                  <p class="text-[10px] text-gray-500 mt-1">Barley Skills</p>
                </div>
              </div>

              <!-- Very Bottom tag line -->
              <div class="absolute bottom-3 left-1/2 -translate-x-1/2 text-[#cf9116] text-[10px] uppercase tracking-[0.3em] font-bold flex items-center gap-2">
                <mat-icon style="font-size: 12px; width: 12px; height: 12px;">star</mat-icon>
                <span>Aprende hoy, transforma tu futuro</span>
                <mat-icon style="font-size: 12px; width: 12px; height: 12px;">star</mat-icon>
              </div>

              <!-- QR Code on the far bottom right (inside the purple corner) -->
              <div class="absolute bottom-8 right-8 z-30 flex flex-col items-center bg-white p-2 rounded-lg shadow-lg">
                <img [src]="qrCodeUrl()" alt="QR Verificar" class="w-[80px] h-[80px]">
                <p class="text-[8px] font-bold text-gray-600 mt-1 uppercase tracking-wider">Verificar</p>
              </div>

            </div>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center print-hide w-full max-w-lg mb-20">
          <button onclick="window.print()" class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:shadow-indigo-500/30 flex items-center justify-center gap-2 text-lg active:scale-95">
            <mat-icon>download</mat-icon> Descargar PDF
          </button>
          <a routerLink="/dashboard" class="flex-1 bg-white border-2 border-indigo-100 hover:bg-indigo-50 text-indigo-700 px-8 py-4 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 text-lg active:scale-95">
            <mat-icon>home</mat-icon> Inicio
          </a>
        </div>
      }
    </div>
  `
})
export class VerifyComponent implements OnInit {
  route = inject(ActivatedRoute);
  courseService = inject(CourseService);

  loading = signal(true);
  error = signal<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  certificate = signal<any>(null);
  qrCodeUrl = signal<string>('');

  ngOnInit() {
    const codigo = this.route.snapshot.paramMap.get('codigo');
    if (!codigo) {
      this.error.set('Código de certificado no proporcionado.');
      this.loading.set(false);
      return;
    }

    this.courseService.verifyCertificate(codigo).subscribe({
      next: async (res) => {
        this.certificate.set(res);
        this.loading.set(false);
        
        try {
          const url = `${window.location.protocol}//${window.location.host}/verificar-certificado/${res.codigo_certificado}`;
          const qrDataUrl = await QRCode.toDataURL(url, { 
            width: 150, 
            margin: 1,
            color: {
              dark: '#2d0a4e', 
              light: '#ffffff'
            }
          });
          this.qrCodeUrl.set(qrDataUrl);
        } catch (err) {
          console.error('Error generating QR code', err);
        }
      },
      error: (err) => {
        console.error('Error verifying certificate', err);
        this.error.set(err.error?.error || 'Error al verificar el certificado. Es posible que no exista.');
        this.loading.set(false);
      }
    });
  }
}
