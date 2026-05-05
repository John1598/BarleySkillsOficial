import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../services/course.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [RouterLink, MatIconModule],
  template: `
    <main class="flex-1 bg-gray-50 dark:bg-slate-900 py-16 transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-16">
          <h1 class="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">Nuestros Cursos Técnicos</h1>
          <p class="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Explora nuestro catálogo de 12 especialidades técnicas diseñadas para prepararte para el mundo laboral.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (course of courseService.courses(); track course.id) {
            <div class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-slate-700 hover:shadow-xl dark:hover:shadow-indigo-900/20 transition-all duration-300 group flex flex-col h-full">
              <div class="relative h-48 overflow-hidden">
                <img [src]="course.imageUrl" [alt]="course.title" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" referrerpolicy="no-referrer">
                <div class="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-indigo-700 dark:text-indigo-400 shadow-sm flex items-center gap-1">
                  <mat-icon class="text-[14px] w-[14px] h-[14px]">library_books</mat-icon> {{ course.subjects.length }} Asignaturas
                </div>
              </div>
              <div class="p-6 flex-1 flex flex-col">
                <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{{ course.title }}</h3>
                <p class="text-gray-600 dark:text-gray-400 mb-6 flex-1 line-clamp-3">{{ course.description }}</p>
                <a [routerLink]="['/courses', course.id]" class="inline-flex items-center justify-center gap-2 w-full bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 font-semibold py-3 px-4 rounded-xl transition-colors">
                  Ver Detalles <mat-icon class="text-[18px] w-[18px] h-[18px]">arrow_forward</mat-icon>
                </a>
              </div>
            </div>
          }
        </div>
      </div>
    </main>
  `
})
export class CoursesComponent {
  courseService = inject(CourseService);
}
