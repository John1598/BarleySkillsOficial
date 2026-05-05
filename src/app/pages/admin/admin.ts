import { Component, inject, OnInit, ChangeDetectorRef, effect } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { AuthService, User } from '../../services/auth.service';
import { CourseService, Course, SubjectDetail, Exam, ExamQuestion } from '../../services/course.service';
import { ConfigService } from '../../services/config.service';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterLink, MatIconModule, ReactiveFormsModule, FormsModule, CommonModule],
  template: `
    <main class="flex-1 bg-gray-50 dark:bg-slate-900 py-8 transition-colors duration-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        @if (user && (user.role === 'admin' || user.role === 'super_admin')) {
          <div class="bg-indigo-900 dark:bg-indigo-950 rounded-2xl p-8 mb-8 text-white shadow-lg flex justify-between items-center transition-colors duration-200">
            <div>
              <h1 class="text-3xl font-bold mb-2 flex items-center gap-3">
                <mat-icon class="text-emerald-400">admin_panel_settings</mat-icon> Panel de Administración
              </h1>
              <p class="text-indigo-200 dark:text-indigo-300">Gestiona usuarios, cursos y configuraciones de la plataforma.</p>
            </div>
            <div class="hidden md:block">
              <img [src]="user.photoUrl" alt="Admin" class="w-16 h-16 rounded-full border-2 border-emerald-400 object-cover" referrerpolicy="no-referrer">
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <!-- Sidebar -->
            <div class="lg:col-span-1">
              <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-4 sticky top-24 transition-colors duration-200">
                <nav class="space-y-2">
                  <button (click)="activeTab = 'users'" [class.bg-indigo-50]="activeTab === 'users'" [class.dark:bg-indigo-900/30]="activeTab === 'users'" [class.text-indigo-700]="activeTab === 'users'" [class.dark:text-indigo-400]="activeTab === 'users'" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium text-left">
                    <mat-icon>people</mat-icon> Usuarios
                  </button>
                  <button (click)="activeTab = 'courses'" [class.bg-indigo-50]="activeTab === 'courses'" [class.dark:bg-indigo-900/30]="activeTab === 'courses'" [class.text-indigo-700]="activeTab === 'courses'" [class.dark:text-indigo-400]="activeTab === 'courses'" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium text-left">
                    <mat-icon>school</mat-icon> Cursos
                  </button>
                  @if (user.role === 'super_admin') {
                    <button (click)="activeTab = 'settings'" [class.bg-indigo-50]="activeTab === 'settings'" [class.dark:bg-indigo-900/30]="activeTab === 'settings'" [class.text-indigo-700]="activeTab === 'settings'" [class.dark:text-indigo-400]="activeTab === 'settings'" class="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium text-left">
                      <mat-icon>settings</mat-icon> Configuración
                    </button>
                  }
                </nav>
              </div>
            </div>

            <!-- Content -->
            <div class="lg:col-span-3">
              @if (activeTab === 'users') {
                <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors duration-200">
                  <div class="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white">Gestión de Usuarios</h2>
                    <span class="bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 px-3 py-1 rounded-full text-sm font-bold">{{ auth.users().length }} Total</span>
                  </div>
                  <div class="overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                      <thead>
                        <tr class="bg-gray-50 dark:bg-slate-900 text-gray-500 dark:text-gray-400 text-sm uppercase tracking-wider border-b border-gray-200 dark:border-slate-700 transition-colors duration-200">
                          <th class="px-6 py-4 font-medium">Usuario</th>
                          <th class="px-6 py-4 font-medium">Rol</th>
                          <th class="px-6 py-4 font-medium">Cursos Inscritos</th>
                          <th class="px-6 py-4 font-medium text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody class="divide-y divide-gray-100 dark:divide-slate-700">
                        @for (u of auth.users(); track u.id) {
                          <tr class="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                            <td class="px-6 py-4">
                              <div class="flex items-center gap-3">
                                <img [src]="u.photoUrl" alt="" class="w-10 h-10 rounded-full object-cover" referrerpolicy="no-referrer">
                                <div>
                                  <div class="font-bold text-gray-900 dark:text-white">{{ u.name }}</div>
                                  <div class="text-sm text-gray-500 dark:text-gray-400">{{ u.email }}</div>
                                </div>
                              </div>
                            </td>
                            <td class="px-6 py-4">
                              @if (user.role === 'super_admin') {
                                <div class="flex items-center gap-2">
                                  <select #roleSelect class="border border-gray-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500">
                                    <option value="student" [selected]="u.role === 'student'">usuario</option>
                                    <option value="admin" [selected]="u.role === 'admin'">admin</option>
                                    <option value="super_admin" [selected]="u.role === 'super_admin'">super_admin</option>
                                  </select>
                                  <button (click)="changeRole(u.id, roleSelect.value)" [disabled]="u.id === user.id && roleSelect.value !== 'super_admin'" title="Guardar cambios" class="bg-emerald-600 hover:bg-emerald-700 text-white px-2 py-1 rounded transition-colors disabled:opacity-50">
                                    <mat-icon class="text-[14px] w-[14px] h-[14px] leading-none">check</mat-icon>
                                  </button>
                                </div>
                              } @else {
                                <span class="px-2 py-1 rounded-md text-xs font-bold uppercase flex items-center w-max"
                                      [class.bg-emerald-100]="u.role === 'admin'"
                                      [class.dark:bg-emerald-900/50]="u.role === 'admin'"
                                      [class.text-emerald-700]="u.role === 'admin'"
                                      [class.dark:text-emerald-400]="u.role === 'admin'"
                                      [class.bg-blue-100]="u.role === 'student'"
                                      [class.dark:bg-blue-900/50]="u.role === 'student'"
                                      [class.text-blue-700]="u.role === 'student'"
                                      [class.dark:text-blue-400]="u.role === 'student'"
                                      [class.bg-purple-100]="u.role === 'super_admin'"
                                      [class.dark:bg-purple-900/50]="u.role === 'super_admin'"
                                      [class.text-purple-700]="u.role === 'super_admin'"
                                      [class.dark:text-purple-400]="u.role === 'super_admin'">
                                  {{ u.role === 'student' ? 'usuario' : u.role }}
                                </span>
                              }
                            </td>
                            <td class="px-6 py-4 text-gray-600 dark:text-gray-400">
                              {{ u.enrolledCourses.length }} cursos
                            </td>
                            <td class="px-6 py-4 text-right">
                              @if (user.role === 'super_admin') {
                                <button (click)="deleteUser(u.id)" [disabled]="u.id === user.id" class="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors ml-2 disabled:opacity-50 disabled:cursor-not-allowed" title="Eliminar">
                                  <mat-icon class="text-[20px] w-[20px] h-[20px]">delete</mat-icon>
                                </button>
                              }
                            </td>
                          </tr>
                        }
                      </tbody>
                    </table>
                  </div>
                </div>
              }

              @if (activeTab === 'courses') {
                <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors duration-200">
                  <div class="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
                    <h2 class="text-xl font-bold text-gray-900 dark:text-white">Control de Cursos</h2>
                    <button (click)="openCourseModal()" class="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm">
                      <mat-icon class="text-[18px] w-[18px] h-[18px]">add</mat-icon> Nuevo Curso
                    </button>
                  </div>
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                    @for (course of courseService.courses(); track course.id) {
                      <div class="border border-gray-200 dark:border-slate-700 rounded-xl p-4 flex gap-4 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors">
                        @if (course.imageUrl) {
                          <img [src]="course.imageUrl" alt="" class="w-20 h-20 rounded-lg object-cover" referrerpolicy="no-referrer">
                        } @else {
                          <div class="w-20 h-20 rounded-lg bg-gray-200 dark:bg-slate-700 flex items-center justify-center">
                            <mat-icon class="text-gray-400 dark:text-gray-500">school</mat-icon>
                          </div>
                        }
                        <div class="flex-1">
                          <h3 class="font-bold text-gray-900 dark:text-white line-clamp-1">{{ course.title }}</h3>
                          <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">{{ course.subjects.length }} Asignaturas • {{ getEnrolledCount(course.id) }} Usuarios inscritos</p>
                          <div class="flex gap-2">
                            <button (click)="openCourseModal(course)" class="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors">Editar</button>
                            <button (click)="manageCourseContent(course)" class="text-xs bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">Contenido</button>
                            <button (click)="deleteCourse(course.id)" class="text-xs bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 px-2 py-1 rounded hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors">Eliminar</button>
                          </div>
                        </div>
                      </div>
                    }
                  </div>
                </div>
              }

              @if (activeTab === 'course-content' && selectedCourse) {
                <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden transition-colors duration-200">
                  <div class="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900 transition-colors duration-200">
                    <div class="flex items-center gap-4">
                      <button (click)="activeTab = 'courses'" class="text-gray-500 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <mat-icon>arrow_back</mat-icon>
                      </button>
                      <h2 class="text-xl font-bold text-gray-900 dark:text-white">Contenido: {{ selectedCourse.title }}</h2>
                    </div>
                    <button (click)="saveCourseContent()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm">
                      <mat-icon class="text-[18px] w-[18px] h-[18px]">save</mat-icon> Guardar Cambios
                    </button>
                  </div>
                  <div class="p-6 space-y-8">
                    @for (subject of selectedCourse.subjectDetails; track subject.id; let sIndex = $index) {
                      <div class="border border-gray-200 dark:border-slate-700 rounded-xl p-6 bg-gray-50 dark:bg-slate-900/50 transition-colors duration-200">
                        <div class="flex justify-between items-center mb-4">
                          <input type="text" [(ngModel)]="subject.title" class="text-xl font-bold text-indigo-900 dark:text-indigo-300 bg-transparent border-b border-dashed border-gray-400 dark:border-slate-600 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none px-1 py-1 w-1/2" placeholder="Nombre de la Asignatura/Nivel">
                          <button (click)="removeSubject(sIndex)" class="text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors">
                            <mat-icon>delete</mat-icon>
                          </button>
                        </div>

                        <!-- Videos -->
                        <div class="mb-6">
                          <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                            Videoclases
                            <button (click)="addVideo(subject)" class="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1"><mat-icon class="text-[14px] w-[14px] h-[14px]">add</mat-icon> Añadir Video</button>
                          </h4>
                          <div class="space-y-2">
                            @for (video of subject.videos; track $index; let vIndex = $index) {
                              <div class="flex gap-2">
                                <input type="text" [(ngModel)]="subject.videos[vIndex]" class="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors" placeholder="URL del video (ej. YouTube embed)">
                                <button (click)="removeVideo(subject, vIndex)" class="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"><mat-icon>close</mat-icon></button>
                              </div>
                            }
                            @if (!subject.videos || subject.videos.length === 0) {
                              <p class="text-sm text-gray-500 dark:text-gray-400 italic">No hay videos.</p>
                            }
                          </div>
                        </div>

                        <!-- Documents -->
                        <div class="mb-6">
                          <h4 class="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center justify-between">
                            Material de Apoyo
                            <button (click)="addDocument(subject)" class="text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-2 py-1 rounded hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors flex items-center gap-1"><mat-icon class="text-[14px] w-[14px] h-[14px]">add</mat-icon> Añadir Documento</button>
                          </h4>
                          <div class="space-y-2">
                            @for (doc of subject.documents; track $index; let dIndex = $index) {
                              <div class="flex gap-2 items-center">
                                @if (doc && doc !== 'Subiendo...') {
                                  <span class="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg text-sm truncate" [title]="doc">Documento cargado</span>
                                } @else if (doc === 'Subiendo...') {
                                  <span class="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-gray-400 rounded-lg text-sm italic">Subiendo...</span>
                                } @else {
                                  <input type="file" accept=".pdf,.doc,.docx" (change)="onDocumentSelected($event, subject, dIndex)" class="flex-1 px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white rounded-lg text-sm outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors">
                                }
                                <button (click)="removeDocument(subject, dIndex)" class="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"><mat-icon>close</mat-icon></button>
                              </div>
                            }
                            @if (!subject.documents || subject.documents.length === 0) {
                              <p class="text-sm text-gray-500 dark:text-gray-400 italic">No hay documentos.</p>
                            }
                          </div>
                        </div>

                        <!-- Exam -->
                        <div class="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700">
                          <div class="flex justify-between items-center mb-4">
                            <h4 class="font-semibold text-gray-800 dark:text-gray-200 text-lg flex items-center gap-2"><mat-icon class="text-indigo-600 dark:text-indigo-400">quiz</mat-icon> Examen</h4>
                            @if (!subject.exam) {
                              <button (click)="createExam(subject)" class="text-sm bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 px-3 py-1 rounded-lg hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors flex items-center gap-1"><mat-icon class="text-[16px] w-[16px] h-[16px]">add</mat-icon> Crear Examen</button>
                            } @else {
                              <button (click)="removeExam(subject)" class="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors flex items-center gap-1"><mat-icon class="text-[16px] w-[16px] h-[16px]">delete</mat-icon> Eliminar Examen</button>
                            }
                          </div>

                          @if (subject.exam) {
                            <div class="bg-white dark:bg-slate-800 p-4 rounded-xl border border-gray-200 dark:border-slate-700 transition-colors duration-200">
                              <input type="text" [(ngModel)]="subject.exam.title" class="w-full font-medium text-gray-900 dark:text-white bg-transparent border-b border-gray-300 dark:border-slate-600 focus:border-indigo-600 dark:focus:border-indigo-400 outline-none px-1 py-1 mb-4 transition-colors" placeholder="Título del Examen">
                              
                              <div class="space-y-6">
                                @for (question of subject.exam.questions; track $index; let qIndex = $index) {
                                  <div class="p-4 border border-indigo-100 dark:border-indigo-900/50 bg-indigo-50/30 dark:bg-indigo-900/10 rounded-lg relative transition-colors duration-200">
                                    <button (click)="removeQuestion(subject.exam, qIndex)" class="absolute top-2 right-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"><mat-icon>close</mat-icon></button>
                                    <input type="text" [(ngModel)]="question.question" class="w-full font-medium text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-md px-3 py-2 mb-3 outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors" placeholder="Pregunta">
                                    
                                    <div class="space-y-2 pl-4">
                                      @for (option of question.options; track $index; let oIndex = $index) {
                                        <div class="flex items-center gap-3 bg-white dark:bg-slate-700 p-2 rounded-lg border border-gray-200 dark:border-slate-600 transition-colors duration-200" [class.border-emerald-500]="question.correctOptionIndex === oIndex" [class.dark:border-emerald-400]="question.correctOptionIndex === oIndex" [class.bg-emerald-50]="question.correctOptionIndex === oIndex" [class.dark:bg-emerald-900/20]="question.correctOptionIndex === oIndex">
                                          <div class="flex flex-col items-center justify-center px-2 border-r border-gray-200 dark:border-slate-600">
                                            <input type="radio" [name]="'correct-' + sIndex + '-' + qIndex" [checked]="question.correctOptionIndex === oIndex" (change)="question.correctOptionIndex = oIndex" class="w-4 h-4 text-emerald-600 dark:text-emerald-500 focus:ring-emerald-500 dark:focus:ring-emerald-400 cursor-pointer" [title]="'Marcar como respuesta correcta'">
                                            <span class="text-[10px] text-gray-500 dark:text-gray-400 font-medium mt-1 text-center leading-tight">Respuesta<br>Correcta</span>
                                          </div>
                                          <input type="text" [(ngModel)]="question.options[oIndex]" class="flex-1 bg-transparent border-none px-2 py-1 text-sm text-gray-900 dark:text-white outline-none focus:ring-0" placeholder="Escribe la opción aquí">
                                          <button (click)="removeOption(question, oIndex)" class="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1" title="Eliminar opción"><mat-icon class="text-[18px] w-[18px] h-[18px]">delete_outline</mat-icon></button>
                                        </div>
                                      }
                                      <button (click)="addOption(question)" class="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium flex items-center gap-1 mt-2"><mat-icon class="text-[14px] w-[14px] h-[14px]">add</mat-icon> Añadir Opción</button>
                                    </div>
                                  </div>
                                }
                              </div>
                              <button (click)="addQuestion(subject.exam)" class="mt-4 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm w-full justify-center">
                                <mat-icon class="text-[18px] w-[18px] h-[18px]">add_circle</mat-icon> Añadir Pregunta
                              </button>
                            </div>
                          }
                        </div>
                      </div>
                    }

                    <button (click)="addSubject()" class="w-full border-2 border-dashed border-gray-300 dark:border-slate-600 text-gray-500 dark:text-gray-400 hover:border-indigo-500 dark:hover:border-indigo-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2">
                      <mat-icon>add</mat-icon> Añadir Nueva Asignatura / Nivel
                    </button>
                  </div>
                </div>
              }

              @if (activeTab === 'settings' && user.role === 'super_admin') {
                <div class="space-y-8">
                  <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 transition-colors duration-200">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                      <mat-icon class="text-indigo-500">settings</mat-icon> Configuración General
                    </h2>
                    <form [formGroup]="configForm" (ngSubmit)="saveConfig()" class="max-w-2xl">
                    <div class="space-y-6">
                      <div>
                        <label for="institute-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Instituto</label>
                        <input id="institute-name" type="text" formControlName="nombre_institucion" class="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200">
                      </div>
                      
                      <div>
                        <label for="institute-logo" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Logo del Instituto</label>
                        <div class="flex flex-col gap-3">
                          <input type="file" accept="image/*" (change)="onLogoSelected($event)" class="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400">
                          
                          @if (configForm.get('logo')?.value) {
                            <div class="flex items-center gap-4 mt-2">
                              <img [src]="configForm.get('logo')?.value" alt="Logo Preview" class="h-16 object-contain border border-gray-200 dark:border-slate-700 rounded p-1 bg-gray-50 dark:bg-slate-800" referrerpolicy="no-referrer">
                              <span class="text-xs text-gray-500 font-medium">Vista previa</span>
                            </div>
                          }
                        </div>
                      </div>

                      <div>
                        <label for="institute-desc" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción de la plataforma</label>
                        <textarea id="institute-desc" rows="3" formControlName="descripcion" class="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200" placeholder="Descripción breve..."></textarea>
                      </div>

                      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label for="institute-address" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dirección Física</label>
                          <input id="institute-address" type="text" formControlName="direccion" class="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200" placeholder="Avenida Siempre Viva 123">
                        </div>
                        <div>
                          <label for="institute-phone" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Teléfono</label>
                          <input id="institute-phone" type="text" formControlName="telefono" class="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200" placeholder="+1 234 567 8900">
                        </div>
                        <div>
                          <label for="institute-email" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Correo Electrónico</label>
                          <input id="institute-email" type="email" formControlName="correo" class="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200" placeholder="contacto@ejemplo.com">
                        </div>
                        <div>
                          <label for="institute-x" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL X (Twitter)</label>
                          <input id="institute-x" type="text" formControlName="x" class="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200" placeholder="https://x.com/...">
                        </div>
                        <div>
                          <label for="institute-instagram" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL Instagram</label>
                          <input id="institute-instagram" type="text" formControlName="instagram" class="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200" placeholder="https://instagram.com/...">
                        </div>
                        <div>
                          <label for="institute-tiktok" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL TikTok</label>
                          <input id="institute-tiktok" type="text" formControlName="tiktok" class="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200" placeholder="https://tiktok.com/@...">
                        </div>
                        <div class="md:col-span-2">
                          <label for="institute-mapa_url" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URL de Google Maps (enlace del iframe src)</label>
                          <input id="institute-mapa_url" type="text" formControlName="mapa_url" class="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200" placeholder="https://www.google.com/maps/embed?...">
                        </div>
                      </div>

                      <div>
                        <label for="institute-copyright" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pie de página (Copyright Footer)</label>
                        <textarea id="institute-copyright" rows="2" formControlName="copyright" class="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200" placeholder="© 2026 Instituto - Todos los derechos reservados"></textarea>
                      </div>

                      <div class="pt-4 flex justify-end">
                        <button id="saveConfigBtn" type="submit" [disabled]="configForm.invalid" class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                          Guardar Cambios
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
                </div>
              }
            </div>
          </div>
        } @else {
          <div class="text-center py-20">
            <mat-icon class="text-6xl text-red-500 mb-4">gpp_bad</mat-icon>
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">Acceso Denegado</h2>
            <p class="text-gray-500 dark:text-gray-400 mb-6">No tienes permisos para ver esta página.</p>
            <a routerLink="/" class="text-indigo-600 dark:text-indigo-400 hover:underline">Volver al inicio</a>
          </div>
        }
      </div>
    </main>

    <!-- Course Modal -->
    @if (showCourseModal) {
      <div class="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center p-4 z-50 transition-colors duration-200">
        <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors duration-200">
          <div class="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center sticky top-0 bg-white dark:bg-slate-800 z-10 transition-colors duration-200">
            <h2 class="text-xl font-bold text-gray-900 dark:text-white">{{ editingCourse ? 'Editar Curso' : 'Nuevo Curso' }}</h2>
            <button (click)="closeCourseModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
              <mat-icon>close</mat-icon>
            </button>
          </div>
          <div class="p-6">
            <form [formGroup]="courseForm" (ngSubmit)="saveCourse()" class="space-y-4">
              <div>
                <label for="course-title" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Título</label>
                <input id="course-title" type="text" formControlName="title" class="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200">
              </div>
              
              <div>
                <label for="course-desc" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Descripción</label>
                <textarea id="course-desc" formControlName="description" rows="3" class="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200"></textarea>
              </div>

              <div class="grid grid-cols-1 gap-4">
                <div>
                  <label for="course-img" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Imagen del curso</label>
                  <div class="flex gap-2 mb-2">
                    <input type="file" accept="image/*" (change)="onCourseImageSelected($event)" class="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400">
                  </div>
                  <input id="course-img" type="text" formControlName="imageUrl" placeholder="O introduce una URL de imagen..." class="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200">
                  @if (courseForm.get('imageUrl')?.value) {
                    <div class="mt-2 flex items-center gap-3">
                      <img [src]="courseForm.get('imageUrl')?.value" alt="Preview" class="h-16 w-32 object-cover rounded shadow-sm border border-gray-200 dark:border-slate-600" referrerpolicy="no-referrer">
                      <span class="text-xs text-gray-500 font-medium">Vista previa</span>
                    </div>
                  }
                </div>
              </div>

              <div>
                <label for="course-subj" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asignaturas (separadas por coma)</label>
                <input id="course-subj" type="text" formControlName="subjects" class="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200">
              </div>

              <div>
                <label for="course-vid" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">URLs de Videos (separados por coma)</label>
                <input id="course-vid" type="text" formControlName="videos" class="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200" placeholder="https://youtube.com/embed/..., ...">
              </div>

              <div>
                <label for="course-doc" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Documentos (separados por coma)</label>
                <input id="course-doc" type="text" formControlName="documents" class="w-full px-4 py-2 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 text-gray-900 dark:text-white rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-colors duration-200" placeholder="Guía.pdf, Manual.pdf">
              </div>

              <div class="pt-4 flex justify-end gap-3">
                <button type="button" (click)="closeCourseModal()" class="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors font-medium">
                  Cancelar
                </button>
                <button type="submit" [disabled]="courseForm.invalid" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed">
                  Guardar Curso
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    }

    <!-- Confirmation Modal -->
    @if (confirmModal.isOpen) {
      <div class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6">
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ confirmModal.title }}</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-6">{{ confirmModal.message }}</p>
          <div class="flex justify-end gap-3">
            <button (click)="closeConfirmModal()" class="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-800 dark:text-white rounded-lg transition-colors font-medium">
              Cancelar
            </button>
            <button (click)="confirmAction()" 
              [class.bg-red-600]="confirmModal.isDanger" [class.hover:bg-red-700]="confirmModal.isDanger" 
              [class.bg-indigo-600]="!confirmModal.isDanger" [class.hover:bg-indigo-700]="!confirmModal.isDanger" 
              class="px-4 py-2 text-white rounded-lg transition-colors font-medium">
              Confirmar
            </button>
          </div>
        </div>
      </div>
    }
  `
})
export class AdminComponent implements OnInit {
  auth = inject(AuthService);
  courseService = inject(CourseService);
  configService = inject(ConfigService);
  router = inject(Router);
  fb = inject(FormBuilder);
  cdr = inject(ChangeDetectorRef);

  user: User | null = null;
  activeTab: 'users' | 'courses' | 'settings' | 'course-content' = 'users';
  selectedCourse: Course | null = null;

  showCourseModal = false;
  editingCourse: Course | null = null;
  
  courseForm: FormGroup = this.fb.group({
    title: ['', Validators.required],
    description: ['', Validators.required],
    imageUrl: [''],
    subjects: ['', Validators.required],
    videos: [''],
    documents: ['']
  });

  configForm: FormGroup = this.fb.group({
    nombre_institucion: ['', Validators.required],
    logo: [''],
    copyright: ['© 2026 Instituto - Todos los derechos reservados'],
    descripcion: [''],
    direccion: [''],
    telefono: [''],
    correo: [''],
    x: [''],
    instagram: [''],
    tiktok: [''],
    mapa_url: ['']
  });

  constructor() {
    this.configService.loadConfig();
    effect(() => {
      const config = this.configService.config();
      if (config) {
        this.configForm.patchValue({
          nombre_institucion: config.nombre_institucion || 'Barley Skills',
          logo: config.logo || '',
          copyright: config.copyright || '© 2026 Barley Skills - Todos los derechos reservados',
          descripcion: config.descripcion || '',
          direccion: config.direccion || '',
          telefono: config.telefono || '',
          correo: config.correo || '',
          x: config.x || '',
          instagram: config.instagram || '',
          tiktok: config.tiktok || '',
          mapa_url: config.mapa_url || ''
        });
      }
    });
  }

  ngOnInit() {
    this.user = this.auth.currentUser();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/']);
  }

  getEnrolledCount(courseId: string): number {
    return this.auth.users().filter(u => u.enrolledCourses.includes(courseId)).length;
  }

  confirmModal = { isOpen: false, title: '', message: '', isDanger: true, action: () => {} };

  openConfirmModal(title: string, message: string, isDanger: boolean, action: () => void) {
    this.confirmModal = { isOpen: true, title, message, isDanger, action };
  }

  closeConfirmModal() {
    this.confirmModal = { isOpen: false, title: '', message: '', isDanger: true, action: () => {} };
  }

  async confirmAction() {
    if (this.confirmModal.action) {
      this.confirmModal.action();
    }
    this.closeConfirmModal();
  }

  async deleteUser(id: string) {
    this.openConfirmModal('Eliminar Usuario', '¿Estás seguro de eliminar este usuario?', true, async () => {
      try {
        await this.auth.deleteUser(id);
      } catch (e) {
        // silently fail or console error as we remove alerts
        console.error(e);
      }
    });
  }

  async changeRole(id: string, newRole: string) {
    this.openConfirmModal('Cambiar Rol', '¿Estás seguro de cambiar el rol de este usuario?', false, async () => {
      try {
        await this.auth.updateUserRole(id, newRole);
      } catch (e) {
        console.error(e);
      }
    });
  }

  async deleteCourse(id: string) {
    this.openConfirmModal('Eliminar Curso', '¿Estás seguro de eliminar este curso?', true, async () => {
      try {
        await new Promise<void>((resolve, reject) => {
          this.courseService.deleteCourse(id).subscribe({
            next: () => resolve(),
            error: (err) => reject(err)
          });
        });
      } catch (e) {
        console.error(e);
      }
    });
  }

  onLogoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.courseService.uploadImage(file).subscribe({
        next: (res) => {
          this.configForm.patchValue({ logo: res.url });
          this.configForm.markAsDirty();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error uploading logo image', err)
      });
    }
  }

  saveConfig() {
    if (this.configForm.invalid) return;
    this.configService.updateConfig(this.configForm.value);
    
    // Mostramos un mensaje inline temporal
    const prevBtnText = document.getElementById('saveConfigBtn')?.innerText;
    const btn = document.getElementById('saveConfigBtn');
    if (btn) {
      btn.innerText = '¡Guardado!';
      btn.classList.add('bg-emerald-600', 'hover:bg-emerald-700');
      btn.classList.remove('bg-indigo-600', 'hover:bg-indigo-700');
      setTimeout(() => {
        btn.innerText = prevBtnText || 'Guardar Cambios';
        btn.classList.remove('bg-emerald-600', 'hover:bg-emerald-700');
        btn.classList.add('bg-indigo-600', 'hover:bg-indigo-700');
      }, 3000);
    }
  }

  openCourseModal(course?: Course) {
    if (course) {
      this.editingCourse = course;
      this.courseForm.patchValue({
        title: course.title,
        description: course.description,
        imageUrl: course.imageUrl,
        subjects: course.subjects.join(', '),
        videos: course.internalContent?.videos?.join(', ') || '',
        documents: course.internalContent?.documents?.join(', ') || ''
      });
    } else {
      this.editingCourse = null;
      this.courseForm.reset({
        imageUrl: '',
        videos: '',
        documents: ''
      });
    }
    this.showCourseModal = true;
  }

  closeCourseModal() {
    this.showCourseModal = false;
    this.editingCourse = null;
    this.courseForm.reset();
  }

  onCourseImageSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.courseService.uploadImage(file).subscribe({
        next: (res) => {
          this.courseForm.patchValue({ imageUrl: res.url });
          this.courseForm.markAsDirty();
          this.cdr.detectChanges();
        },
        error: (err) => console.error('Error uploading course image', err)
      });
    }
  }

  saveCourse() {
    if (this.courseForm.invalid) return;

    const formValue = this.courseForm.value;
    const subjectsArray = formValue.subjects.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    const videosArray = formValue.videos ? formValue.videos.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [];
    const documentsArray = formValue.documents ? formValue.documents.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0) : [];

    const subjectDetailsArray = subjectsArray.map((title: string, index: number) => {
      const existing = this.editingCourse?.subjectDetails?.find(s => s.title === title);
      if (existing) return existing;

      return {
        id: 's' + Math.random().toString(36).substring(2, 9),
        title: title,
        videos: index === 0 ? videosArray : [],
        documents: index === 0 ? documentsArray : [],
        exam: {
          id: 'e' + Math.random().toString(36).substring(2, 9),
          title: 'Examen de ' + title,
          questions: [
            {
              question: 'Pregunta de prueba para ' + title,
              options: ['Opción A', 'Opción B', 'Opción C'],
              correctOptionIndex: 0
            }
          ]
        }
      };
    });

    if (this.editingCourse) {
      const updatedCourse: Course = {
        ...this.editingCourse,
        title: formValue.title,
        description: formValue.description,
        imageUrl: formValue.imageUrl,
        subjects: subjectsArray,
        subjectDetails: subjectDetailsArray,
        internalContent: {
          videos: videosArray,
          documents: documentsArray
        }
      };
      this.courseService.updateCourse(updatedCourse).subscribe({
        next: () => {
          this.closeCourseModal();
        },
        error: (err) => console.error(err)
      });
    } else {
      const newCourse: Course = {
        id: 'c' + Math.random().toString(36).substring(2, 9),
        title: formValue.title,
        description: formValue.description,
        imageUrl: formValue.imageUrl,
        subjects: subjectsArray,
        subjectDetails: subjectDetailsArray,
        internalContent: {
          videos: videosArray,
          documents: documentsArray
        }
      };

      const courseExists = this.courseService.courses().some(c => c.title.toLowerCase() === formValue.title.toLowerCase());
      if (courseExists) {
        alert('Error: El curso ya existe en la lista');
        return;
      }

      this.courseService.addCourse(newCourse).subscribe({
        next: () => {
          alert('Curso creado de forma exitosa');
          this.courseForm.reset();
          this.closeCourseModal();
        },
        error: (err) => console.error(err)
      });
    }
  }

  manageCourseContent(course: Course) {
    this.selectedCourse = JSON.parse(JSON.stringify(course));
    if (!this.selectedCourse!.subjectDetails) {
      this.selectedCourse!.subjectDetails = [];
    }
    this.activeTab = 'course-content';
  }

  saveCourseContent() {
    if (this.selectedCourse) {
      this.selectedCourse.subjects = this.selectedCourse.subjectDetails!.map(s => s.title);
      this.courseService.updateCourse(this.selectedCourse).subscribe({
        next: () => {
          alert("Curso guardado correctamente");
          this.activeTab = 'courses';
          this.selectedCourse = null;
        },
        error: (err) => console.error('Error saving course content:', err)
      });
    }
  }

  addSubject() {
    if (this.selectedCourse && this.selectedCourse.subjectDetails) {
      this.selectedCourse.subjectDetails.push({
        id: 's' + Math.random().toString(36).substring(2, 9),
        title: 'Nueva Asignatura',
        videos: [],
        documents: []
      });
    }
  }

  removeSubject(index: number) {
    if (this.selectedCourse && this.selectedCourse.subjectDetails) {
      this.selectedCourse.subjectDetails.splice(index, 1);
    }
  }

  addVideo(subject: SubjectDetail) {
    if (!subject.videos) subject.videos = [];
    subject.videos.push('');
  }

  removeVideo(subject: SubjectDetail, index: number) {
    subject.videos.splice(index, 1);
  }

  addDocument(subject: SubjectDetail) {
    if (!subject.documents) subject.documents = [];
    subject.documents.push('');
  }

  onDocumentSelected(event: Event, subject: SubjectDetail, index: number) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      subject.documents[index] = 'Subiendo...'; // Temp visual state
      this.courseService.uploadPdf(file).subscribe({
        next: (res) => {
          subject.documents[index] = res.url;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error uploading document:', err);
          subject.documents[index] = '';
          alert('Error al subir el archivo');
        }
      });
    }
  }

  removeDocument(subject: SubjectDetail, index: number) {
    subject.documents.splice(index, 1);
  }

  createExam(subject: SubjectDetail) {
    subject.exam = {
      id: 'e' + Math.random().toString(36).substring(2, 9),
      title: 'Examen de ' + subject.title,
      questions: [
        {
          question: 'Nueva pregunta',
          options: ['Opción 1', 'Opción 2'],
          correctOptionIndex: 0
        }
      ]
    };
  }

  removeExam(subject: SubjectDetail) {
    delete subject.exam;
  }

  addQuestion(exam: Exam) {
    exam.questions.push({
      question: 'Nueva pregunta',
      options: ['Opción 1', 'Opción 2'],
      correctOptionIndex: 0
    });
  }

  removeQuestion(exam: Exam, index: number) {
    exam.questions.splice(index, 1);
  }

  addOption(question: ExamQuestion) {
    question.options.push('Nueva opción');
  }

  removeOption(question: ExamQuestion, index: number) {
    question.options.splice(index, 1);
    if (question.correctOptionIndex >= question.options.length) {
      question.correctOptionIndex = Math.max(0, question.options.length - 1);
    } else if (question.correctOptionIndex === index) {
      question.correctOptionIndex = 0;
    }
  }
}
