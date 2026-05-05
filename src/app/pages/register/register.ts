import { Component, inject, OnInit, effect, ChangeDetectorRef } from '@angular/core';
import { RouterLink, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CourseService, Course } from '../../services/course.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, MatIconModule],
  template: `
    <main class="flex-1 bg-gray-50 dark:bg-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200">
      <div class="max-w-2xl w-full space-y-8 bg-white dark:bg-slate-800 p-10 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 transition-colors duration-200">
        <div>
          <div class="flex justify-center">
            <div class="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center">
              <mat-icon class="text-4xl w-10 h-10">person_add</mat-icon>
            </div>
          </div>
          <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Crear Cuenta
          </h2>
          <p class="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            O
            <a routerLink="/login" class="font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 transition-colors">
              inicia sesión si ya tienes una
            </a>
          </p>
        </div>
        
        <form class="mt-8 space-y-6" [formGroup]="registerForm" (ngSubmit)="onSubmit()">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Nombre -->
            <div>
              <label for="name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre Completo</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <mat-icon class="text-gray-400 text-[20px] w-[20px] h-[20px]">person</mat-icon>
                </div>
                <input id="name" formControlName="name" type="text" required class="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors" placeholder="Ej. Juan Pérez">
              </div>
            </div>

            <!-- Correo -->
            <div>
              <label for="email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <mat-icon class="text-gray-400 text-[20px] w-[20px] h-[20px]">email</mat-icon>
                </div>
                <input id="email" formControlName="email" type="email" required class="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors" placeholder="correo@ejemplo.com">
              </div>
            </div>

            <!-- Contraseña -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Contraseña</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <mat-icon class="text-gray-400 text-[20px] w-[20px] h-[20px]">lock</mat-icon>
                </div>
                <input id="password" formControlName="password" type="password" required class="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors" placeholder="Mínimo 8 caracteres">
              </div>
              @if (registerForm.get('password')?.invalid && registerForm.get('password')?.touched) {
                <p class="mt-2 text-sm text-red-600 dark:text-red-400">Debe tener mínimo 8 caracteres</p>
              }
            </div>

            <!-- Confirmar Contraseña -->
            <div>
              <label for="confirmPassword" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirmar Contraseña</label>
              <div class="relative">
                <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <mat-icon class="text-gray-400 text-[20px] w-[20px] h-[20px]">lock_clock</mat-icon>
                </div>
                <input id="confirmPassword" formControlName="confirmPassword" type="password" required class="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors" placeholder="Repite tu contraseña">
              </div>
              @if (registerForm.hasError('mismatch') && registerForm.get('confirmPassword')?.touched) {
                <p class="mt-2 text-sm text-red-600 dark:text-red-400">Las contraseñas no coinciden</p>
              }
            </div>

            <!-- Foto -->
            <div>
              <label for="photoUrl" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Foto de Perfil (URL o Imagen local)</label>
              <div class="flex flex-col gap-2">
                <input type="file" accept="image/*" (change)="onProfilePhotoSelected($event)" class="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900/30 dark:file:text-emerald-400">
                <div class="relative">
                  <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <mat-icon class="text-gray-400 text-[20px] w-[20px] h-[20px]">image</mat-icon>
                  </div>
                  <input id="photoUrl" formControlName="photoUrl" type="url" class="appearance-none rounded-xl relative block w-full px-3 py-3 pl-10 border border-gray-300 dark:border-slate-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-slate-700 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm transition-colors" placeholder="O introduce URL manualmente...">
                </div>
                @if (registerForm.get('photoUrl')?.value) {
                  <div class="mt-2 flex items-center gap-3">
                    <img [src]="registerForm.get('photoUrl')?.value" alt="Preview" class="w-10 h-10 rounded-full object-cover border border-gray-200 dark:border-slate-600 shadow-sm" referrerpolicy="no-referrer" onerror="this.src='https://picsum.photos/seed/user/200/200'">
                    <span class="text-xs text-gray-500 font-medium">Vista previa</span>
                  </div>
                }
              </div>
            </div>

            <!-- Curso Técnico -->
            <div class="md:col-span-2 pt-2 border-t border-gray-100 dark:border-slate-700">
              <p id="course-selection-label" class="block text-lg font-bold text-gray-900 dark:text-white mb-4">Selecciona tu Curso Técnico <span class="text-red-500 text-sm font-normal">*</span></p>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[480px] overflow-y-auto pr-2 pb-2 custom-scrollbar" aria-labelledby="course-selection-label" role="radiogroup">
                @for (course of courseService.courses(); track course.id) {
                  <div 
                    (click)="selectCourse(course.id)"
                    (keydown.enter)="selectCourse(course.id)"
                    tabindex="0"
                    role="radio"
                    [attr.aria-checked]="registerForm.get('selectedCourse')?.value === course.id"
                    class="relative border-2 rounded-2xl cursor-pointer overflow-hidden transition-all duration-200 flex flex-col h-full bg-white dark:bg-slate-800 focus:outline-none focus:ring-4"
                    [class.border-emerald-500]="registerForm.get('selectedCourse')?.value === course.id"
                    [class.border-gray-200]="registerForm.get('selectedCourse')?.value !== course.id"
                    [class.dark:border-slate-700]="registerForm.get('selectedCourse')?.value !== course.id"
                    [class.ring-4]="registerForm.get('selectedCourse')?.value === course.id"
                    [class.ring-emerald-500/20]="registerForm.get('selectedCourse')?.value === course.id"
                    [class.shadow-md]="registerForm.get('selectedCourse')?.value === course.id"
                    [class.shadow-sm]="registerForm.get('selectedCourse')?.value !== course.id"
                  >
                    @if (registerForm.get('selectedCourse')?.value === course.id) {
                      <div class="absolute top-3 right-3 bg-emerald-500 text-white p-1.5 rounded-full z-10 shadow-md transform scale-110">
                        <mat-icon class="text-[18px] w-[18px] h-[18px] block">check</mat-icon>
                      </div>
                    }
                    <div class="h-36 w-full relative shrink-0 bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                      @if (course.imageUrl) {
                        <img [src]="course.imageUrl" alt="{{ course.title }}" class="w-full h-full object-cover" referrerpolicy="no-referrer">
                      } @else {
                        <mat-icon class="text-gray-400 dark:text-gray-500 w-12 h-12 text-[48px]">school</mat-icon>
                      }
                      <div class="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2.5 py-1 rounded-md backdrop-blur-sm shadow-sm flex items-center gap-1 font-medium">
                        <mat-icon class="text-[14px] w-[14px] h-[14px]">library_books</mat-icon> {{ course.subjects.length }}
                      </div>
                    </div>
                    <div class="p-4 flex-1 flex flex-col justify-between"
                         [class.bg-emerald-50]="registerForm.get('selectedCourse')?.value === course.id"
                         [class.dark:bg-emerald-900/10]="registerForm.get('selectedCourse')?.value === course.id">
                      <div>
                        <h4 class="font-bold text-lg dark:text-white line-clamp-2 mb-2 leading-tight" 
                            [class.text-emerald-800]="registerForm.get('selectedCourse')?.value === course.id" 
                            [class.text-gray-900]="registerForm.get('selectedCourse')?.value !== course.id"
                            [class.dark:text-emerald-400]="registerForm.get('selectedCourse')?.value === course.id">
                          {{ course.title }}
                        </h4>
                        <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4">{{ course.description }}</p>
                      </div>
                      <button type="button" 
                        class="w-full py-3 px-4 rounded-xl font-bold transition-all text-sm mt-auto border"
                        [class.bg-emerald-500]="registerForm.get('selectedCourse')?.value === course.id"
                        [class.text-white]="registerForm.get('selectedCourse')?.value === course.id"
                        [class.border-emerald-600]="registerForm.get('selectedCourse')?.value === course.id"
                        
                        [class.bg-gray-50]="registerForm.get('selectedCourse')?.value !== course.id"
                        [class.text-gray-700]="registerForm.get('selectedCourse')?.value !== course.id"
                        [class.border-gray-200]="registerForm.get('selectedCourse')?.value !== course.id"
                        
                        [class.dark:bg-slate-700]="registerForm.get('selectedCourse')?.value !== course.id"
                        [class.dark:text-gray-200]="registerForm.get('selectedCourse')?.value !== course.id"
                        [class.dark:border-slate-600]="registerForm.get('selectedCourse')?.value !== course.id"
                        
                        [class.hover:bg-gray-100]="registerForm.get('selectedCourse')?.value !== course.id"
                        [class.dark:hover:bg-slate-600]="registerForm.get('selectedCourse')?.value !== course.id"
                      >
                        {{ registerForm.get('selectedCourse')?.value === course.id ? 'SELECCIONADO' : 'Elegir Curso' }}
                      </button>
                    </div>
                  </div>
                }
              </div>
              <!-- Validation error for course -->
              @if (registerForm.get('selectedCourse')?.errors?.['required'] && registerForm.get('selectedCourse')?.touched) {
                <p class="mt-3 text-sm text-red-500 font-medium flex items-center gap-1">
                  <mat-icon class="text-[16px] w-[16px] h-[16px]">error</mat-icon>
                  Por favor, selecciona un curso para continuar.
                </p>
              }
            </div>
          </div>

          @if (errorMsg) {
            <div class="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md flex items-start gap-3">
              <mat-icon class="text-red-500 dark:text-red-400">error</mat-icon>
              <p class="text-sm text-red-700 dark:text-red-300">{{ errorMsg }}</p>
            </div>
          }

          <div>
            <button type="submit" [disabled]="registerForm.invalid" class="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md">
              <span class="absolute left-0 inset-y-0 flex items-center pl-3">
                <mat-icon class="h-5 w-5 text-emerald-500 group-hover:text-emerald-400 transition-colors">person_add</mat-icon>
              </span>
              Completar Registro
            </button>
          </div>
        </form>
      </div>
    </main>
  `
})
export class RegisterComponent implements OnInit {
  fb = inject(FormBuilder);
  auth = inject(AuthService);
  courseService = inject(CourseService);
  router = inject(Router);
  route = inject(ActivatedRoute);
  cdr = inject(ChangeDetectorRef);

  registerForm = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required]],
    photoUrl: [''],
    selectedCourse: ['', Validators.required]
  }, { validators: this.passwordMatchValidator });

  passwordMatchValidator(g: any) {
    return g.get('password').value === g.get('confirmPassword').value
      ? null : { mismatch: true };
  }

  errorMsg = '';
  selectedCourseData: Course | null | undefined = null;

  constructor() {
    // React to courses loading to update preview if a course was selected via URL
    effect(() => {
      const courses = this.courseService.courses();
      const selectedId = this.registerForm.get('selectedCourse')?.value;
      if (selectedId && courses.length > 0) {
        this.updateCoursePreview(selectedId);
      }
    });
  }

  ngOnInit() {
    // Check if course ID is in URL params
    this.route.queryParams.subscribe(params => {
      const courseId = params['course'];
      if (courseId) {
        this.registerForm.patchValue({ selectedCourse: courseId });
        this.updateCoursePreview(courseId);
      }
    });

    // Listen to course selection changes
    this.registerForm.get('selectedCourse')?.valueChanges.subscribe(courseId => {
      if (courseId) {
        this.updateCoursePreview(courseId);
      }
    });
  }

  updateCoursePreview(courseId: string) {
    this.selectedCourseData = this.courseService.getCourse(courseId);
  }

  onProfilePhotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.courseService.uploadImage(file).subscribe({
        next: (res) => {
          this.registerForm.patchValue({ photoUrl: res.url });
          this.registerForm.get('photoUrl')?.markAsDirty();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error uploading image', err)
      });
    }
  }

  selectCourse(courseId: string) {
    this.registerForm.patchValue({ selectedCourse: courseId });
    this.registerForm.get('selectedCourse')?.markAsTouched();
  }

  async onSubmit() {
    if (this.registerForm.valid) {
      const { name, email, photoUrl, selectedCourse, password } = this.registerForm.value;
      
      const success = await this.auth.register({
        name: name!,
        email: email!,
        photoUrl: photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${name}`,
        role: 'student',
        enrolledCourses: [selectedCourse!],
        grades: {}
      }, password || undefined);

      if (success) {
        this.router.navigate(['/dashboard']);
      } else {
        this.errorMsg = 'El correo electrónico ya está registrado.';
      }
    }
  }
}
