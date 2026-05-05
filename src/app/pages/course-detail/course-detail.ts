import { Component, inject, computed } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { AuthService } from '../../services/auth.service';
import { MatIconModule } from '@angular/material/icon';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-course-detail',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <main class="flex-1 bg-white dark:bg-slate-900 transition-colors duration-200">
      @if (course()) {
        <!-- Hero -->
        <div class="relative h-[400px] overflow-hidden">
          <img [src]="course()!.imageUrl" [alt]="course()!.title" class="w-full h-full object-cover" referrerpolicy="no-referrer">
          <div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
          <div class="absolute bottom-0 left-0 right-0 p-8 max-w-7xl mx-auto">
            <div class="flex items-center gap-2 text-emerald-400 mb-4 font-semibold uppercase tracking-wider text-sm">
              <mat-icon class="text-[18px] w-[18px] h-[18px]">school</mat-icon> Curso Técnico
            </div>
            <h1 class="text-4xl md:text-5xl font-extrabold text-white mb-4">{{ course()!.title }}</h1>
            <p class="text-xl text-gray-300 max-w-3xl">{{ course()!.description }}</p>
          </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <!-- Content -->
            <div class="lg:col-span-2">
              <h2 class="text-3xl font-bold text-gray-900 dark:text-white mb-6">Acerca del Curso</h2>
              <p class="text-lg text-gray-600 dark:text-gray-400 mb-10 leading-relaxed">
                Este programa técnico está diseñado para brindarte las herramientas y conocimientos necesarios para destacar en el área de {{ course()!.title.toLowerCase() }}. Al finalizar, estarás preparado para enfrentar los retos del mercado laboral con confianza y profesionalismo.
              </p>

              <h3 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                <mat-icon class="text-indigo-600 dark:text-indigo-400">menu_book</mat-icon> Módulos
              </h3>
              <div class="bg-gray-50 dark:bg-slate-800 rounded-2xl p-6 border border-gray-100 dark:border-slate-700 mb-10 transition-colors duration-200">
                <ul class="space-y-4">
                  @for (subject of course()!.subjects; track subject; let i = $index) {
                    <li class="flex items-start gap-4">
                      <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold flex-shrink-0 transition-colors duration-200">
                        {{ i + 1 }}
                      </div>
                      <div>
                        <h4 class="text-lg font-semibold text-gray-900 dark:text-white">{{ subject }}</h4>
                        <p class="text-gray-500 dark:text-gray-400 text-sm">Módulo fundamental para el desarrollo de competencias.</p>
                      </div>
                    </li>
                  }
                </ul>
              </div>
            </div>

            <!-- Sidebar -->
            <div class="lg:col-span-1">
              <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-gray-100 dark:border-slate-700 p-8 sticky top-24 transition-colors duration-200">
                <div class="flex items-center justify-between mb-6 pb-6 border-b border-gray-100 dark:border-slate-700 transition-colors duration-200">
                  <span class="text-gray-500 dark:text-gray-400 font-medium">Asignaturas</span>
                  <span class="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-1">
                    <mat-icon class="text-indigo-600 dark:text-indigo-400">library_books</mat-icon> {{ course()!.subjects.length }}
                  </span>
                </div>
                <div class="flex items-center justify-between mb-8 pb-6 border-b border-gray-100 dark:border-slate-700 transition-colors duration-200">
                  <span class="text-gray-500 dark:text-gray-400 font-medium">Modalidad</span>
                  <span class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1">
                    <mat-icon class="text-emerald-500 dark:text-emerald-400">laptop_mac</mat-icon> Virtual
                  </span>
                </div>
                
                @if (!auth.currentUser()) {
                  <a routerLink="/register" [queryParams]="{course: course()!.id}" class="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none">
                    Inscribirse Ahora <mat-icon>arrow_forward</mat-icon>
                  </a>
                } @else if (!isEnrolled()) {
                  <button (click)="enrollAndGo()" class="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 dark:shadow-none">
                    Inscribirse Ahora <mat-icon>arrow_forward</mat-icon>
                  </button>
                } @else {
                  <a routerLink="/dashboard" class="w-full bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold py-4 px-6 rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-200 dark:shadow-none">
                    Ir al Curso <mat-icon>school</mat-icon>
                  </a>
                }
                <p class="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                  Inscripciones abiertas. Cupos limitados.
                </p>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="flex-1 flex items-center justify-center py-32">
          <div class="text-center">
            <mat-icon class="text-6xl text-gray-300 dark:text-slate-600 mb-4">error_outline</mat-icon>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Curso no encontrado</h2>
            <a routerLink="/courses" class="text-indigo-600 dark:text-indigo-400 hover:underline">Volver a cursos</a>
          </div>
        </div>
      }
    </main>
  `
})
export class CourseDetailComponent {
  route = inject(ActivatedRoute);
  router = inject(Router);
  courseService = inject(CourseService);
  auth = inject(AuthService);
  
  // Convert route paramMap to a signal
  private paramMap = toSignal(this.route.paramMap);
  
  // Computed signal that depends on both the route param and the courses list
  course = computed(() => {
    const id = this.paramMap()?.get('id');
    if (!id) return undefined;
    return this.courseService.getCourse(id);
  });

  isEnrolled = computed(() => {
    const user = this.auth.currentUser();
    const currentCourse = this.course();
    if (!user || !currentCourse) return false;
    return user.enrolledCourses.includes(currentCourse.id);
  });

  enrollAndGo() {
    const user = this.auth.currentUser();
    const currentCourse = this.course();
    if (user && currentCourse && !this.isEnrolled()) {
      const updatedUser = { ...user };
      updatedUser.enrolledCourses.push(currentCourse.id);
      
      if (!updatedUser.grades[currentCourse.id]) {
        updatedUser.grades[currentCourse.id] = {};
      }
      
      this.auth.updateUser(updatedUser);
      this.router.navigate(['/dashboard']);
    }
  }
}
