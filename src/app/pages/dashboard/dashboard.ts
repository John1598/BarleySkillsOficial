import {
  Component,
  inject,
  OnInit,
  signal,
  ChangeDetectorRef,
} from "@angular/core";
import { Router } from "@angular/router";
import { AuthService, User } from "../../services/auth.service";
import {
  CourseService,
  Course,
  Exam,
  SubjectDetail,
} from "../../services/course.service";
import { FileService } from "../../services/file.service";
import { MatIconModule } from "@angular/material/icon";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [MatIconModule, ReactiveFormsModule],
  template: `
    <main
      class="flex-1 bg-gray-50 dark:bg-slate-900 py-8 transition-colors duration-200"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        @if (user) {
          <!-- Header -->
          <div
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 mb-8 flex flex-col md:flex-row items-center gap-6 transition-colors duration-200"
          >
            <img
              [src]="user.photoUrl"
              alt="Profile"
              class="w-24 h-24 rounded-full border-4 border-emerald-100 dark:border-emerald-900/50 object-cover"
              referrerpolicy="no-referrer"
            />
            <div class="flex-1 text-center md:text-left">
              <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                ¡Hola, {{ user.name }}!
              </h1>
              <p
                class="text-gray-500 dark:text-gray-400 flex items-center justify-center md:justify-start gap-2"
              >
                <mat-icon class="text-[18px] w-[18px] h-[18px]">email</mat-icon>
                {{ user.email }}
              </p>
            </div>
            <div class="flex gap-3">
              <button
                (click)="activeTab = 'courses'"
                [class.bg-indigo-600]="activeTab === 'courses'"
                [class.text-white]="activeTab === 'courses'"
                [class.bg-indigo-50]="activeTab !== 'courses'"
                [class.dark:bg-indigo-900/30]="activeTab !== 'courses'"
                [class.text-indigo-700]="activeTab !== 'courses'"
                [class.dark:text-indigo-400]="activeTab !== 'courses'"
                class="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <mat-icon>school</mat-icon> Mis Cursos
              </button>
              <button
                (click)="activeTab = 'profile'"
                [class.bg-indigo-600]="activeTab === 'profile'"
                [class.text-white]="activeTab === 'profile'"
                [class.bg-indigo-50]="activeTab !== 'profile'"
                [class.dark:bg-indigo-900/30]="activeTab !== 'profile'"
                [class.text-indigo-700]="activeTab !== 'profile'"
                [class.dark:text-indigo-400]="activeTab !== 'profile'"
                class="px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <mat-icon>person</mat-icon> Mi Perfil
              </button>
              <button
                (click)="showAddCourseModal = true"
                class="bg-emerald-500 text-white hover:bg-emerald-600 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm"
              >
                <mat-icon>add</mat-icon> Añadir Curso
              </button>
            </div>
          </div>

          @if (activeTab === "courses") {
            <!-- Enrolled Courses -->
            <h2
              class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
            >
              <mat-icon class="text-emerald-500">school</mat-icon> Mis Cursos
            </h2>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              @for (courseId of user.enrolledCourses; track courseId) {
                @if (getCourse(courseId); as course) {
                  <div
                    class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden flex flex-col transition-colors duration-200"
                  >
                    <div
                      class="h-32 relative bg-indigo-900/10 dark:bg-slate-900/50"
                    >
                      @if (course.imageUrl) {
                        <img
                          [src]="course.imageUrl"
                          [alt]="course.title"
                          class="w-full h-full object-cover"
                          referrerpolicy="no-referrer"
                        />
                      } @else {
                        <div
                          class="w-full h-full flex items-center justify-center"
                        >
                          <mat-icon
                            class="text-indigo-400 dark:text-indigo-500 text-[48px] w-12 h-12"
                            >school</mat-icon
                          >
                        </div>
                      }
                      <div
                        class="absolute inset-0 bg-indigo-900/40 dark:bg-slate-900/60"
                      ></div>
                      <h3
                        class="absolute bottom-4 left-4 right-4 text-white font-bold text-lg truncate"
                      >
                        {{ course.title }}
                      </h3>
                    </div>

                    <div class="p-6 flex-1 flex flex-col">
                      <div class="mb-4">
                        <div class="flex justify-between text-sm mb-1">
                          <span
                            class="text-gray-500 dark:text-gray-400 font-medium"
                            >Progreso General</span
                          >
                          <span
                            class="text-indigo-600 dark:text-indigo-400 font-bold"
                            >{{ getCourseProgress(courseId) }}%</span
                          >
                        </div>
                        <div
                          class="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2"
                        >
                          <div
                            class="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-1000"
                            [style.width.%]="getCourseProgress(courseId)"
                          ></div>
                        </div>
                      </div>

                      <div class="space-y-3 mb-6 flex-1">
                        <h4
                          class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider"
                        >
                          Módulos
                        </h4>
                        @for (subject of course.subjects; track subject) {
                          <div
                            class="flex justify-between items-center text-sm"
                          >
                            <span
                              class="text-gray-600 dark:text-gray-400 truncate mr-2"
                              >{{ subject }}</span
                            >
                            <span
                              class="font-medium px-2 py-1 rounded-md"
                              [class.bg-emerald-100]="
                                getGrade(courseId, subject) >= 70
                              "
                              [class.dark:bg-emerald-900/50]="
                                getGrade(courseId, subject) >= 70
                              "
                              [class.text-emerald-700]="
                                getGrade(courseId, subject) >= 70
                              "
                              [class.dark:text-emerald-400]="
                                getGrade(courseId, subject) >= 70
                              "
                              [class.bg-red-100]="
                                getGrade(courseId, subject) < 70 &&
                                getGrade(courseId, subject) > 0
                              "
                              [class.dark:bg-red-900/50]="
                                getGrade(courseId, subject) < 70 &&
                                getGrade(courseId, subject) > 0
                              "
                              [class.text-red-700]="
                                getGrade(courseId, subject) < 70 &&
                                getGrade(courseId, subject) > 0
                              "
                              [class.dark:text-red-400]="
                                getGrade(courseId, subject) < 70 &&
                                getGrade(courseId, subject) > 0
                              "
                              [class.bg-gray-100]="
                                getGrade(courseId, subject) === 0
                              "
                              [class.dark:bg-slate-700]="
                                getGrade(courseId, subject) === 0
                              "
                              [class.text-gray-500]="
                                getGrade(courseId, subject) === 0
                              "
                              [class.dark:text-gray-400]="
                                getGrade(courseId, subject) === 0
                              "
                            >
                              {{
                                getGrade(courseId, subject) > 0
                                  ? getGrade(courseId, subject)
                                  : "N/A"
                              }}
                            </span>
                          </div>
                        }
                      </div>

                      <div class="flex gap-2 mt-auto">
                        <button
                          (click)="viewCourseContent(course)"
                          class="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-1 shadow-sm"
                        >
                          <mat-icon class="text-[18px] w-[18px] h-[18px]"
                            >play_circle</mat-icon
                          >
                          Contenido
                        </button>
                        @if (getCourseProgress(courseId) === 100) {
                          <button
                            (click)="generateCertificate(course)"
                            class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-1 shadow-sm"
                          >
                            <mat-icon class="text-[18px] w-[18px] h-[18px]"
                              >workspace_premium</mat-icon
                            >
                            Ver Diploma
                          </button>
                        }
                      </div>
                    </div>
                  </div>
                }
              }
              @if (user.enrolledCourses.length === 0) {
                <div
                  class="col-span-full bg-white dark:bg-slate-800 rounded-2xl p-12 text-center border border-dashed border-gray-300 dark:border-slate-600 transition-colors duration-200"
                >
                  <mat-icon
                    class="text-6xl text-gray-300 dark:text-gray-600 mb-4"
                    >school</mat-icon
                  >
                  <h3
                    class="text-xl font-bold text-gray-900 dark:text-white mb-2"
                  >
                    Aún no tienes cursos
                  </h3>
                  <p class="text-gray-500 dark:text-gray-400 mb-6">
                    Inscríbete en tu primer curso técnico para comenzar a
                    aprender.
                  </p>
                  <button
                    (click)="showAddCourseModal = true"
                    class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center gap-2 shadow-sm"
                  >
                    Explorar Catálogo
                  </button>
                </div>
              }
            </div>
          }

          @if (activeTab === "profile") {
            <div
              class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-8 mb-12 max-w-2xl mx-auto transition-colors duration-200"
            >
              <h2
                class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2"
              >
                <mat-icon class="text-indigo-500">manage_accounts</mat-icon>
                Actualizar Perfil
              </h2>

              <form
                [formGroup]="profileForm"
                (ngSubmit)="updateProfile()"
                class="space-y-6"
              >
                <div>
                  <label
                    for="profile-name"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >Nombre Completo</label
                  >
                  <input
                    id="profile-name"
                    type="text"
                    formControlName="name"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-200"
                  />
                </div>

                <div>
                  <label
                    for="profile-email"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >Correo Electrónico</label
                  >
                  <input
                    id="profile-email"
                    type="email"
                    formControlName="email"
                    class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-200"
                  />
                </div>

                <div>
                  <label
                    for="profile-photo"
                    class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >Foto de Perfil (URL o seleccionar archivo)</label
                  >
                  <div class="flex flex-col gap-2 mb-2">
                    <input
                      id="profile-photo"
                      type="file"
                      accept="image/*"
                      (change)="onProfilePhotoSelected($event)"
                      class="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-400"
                    />
                    <input
                      type="text"
                      formControlName="photoUrl"
                      placeholder="O introduce una URL de imagen..."
                      class="w-full px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white transition-colors duration-200"
                    />
                  </div>
                  <div class="mt-2 flex items-center gap-4">
                    <img
                      [src]="
                        profileForm.get('photoUrl')?.value ||
                        'https://picsum.photos/seed/user/200/200'
                      "
                      alt="Preview"
                      class="w-12 h-12 rounded-full object-cover border border-gray-200 dark:border-slate-600"
                      referrerpolicy="no-referrer"
                      (error)="handleImageError($event)"
                    />
                    <span class="text-sm text-gray-500 dark:text-gray-400"
                      >Vista previa</span
                    >
                  </div>
                </div>

                <div
                  class="pt-4 border-t border-gray-100 dark:border-slate-700 flex justify-end transition-colors duration-200"
                >
                  <button
                    type="submit"
                    [disabled]="profileForm.invalid || profileForm.pristine"
                    class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                  >
                    <mat-icon class="text-[18px] w-[18px] h-[18px]"
                      >save</mat-icon
                    >
                    Guardar Cambios
                  </button>
                </div>

                @if (profileUpdateSuccess) {
                  <div
                    class="bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 p-3 rounded-lg text-sm flex items-center gap-2 transition-colors duration-200"
                  >
                    <mat-icon class="text-[18px] w-[18px] h-[18px]"
                      >check_circle</mat-icon
                    >
                    Perfil actualizado correctamente.
                  </div>
                }
              </form>
            </div>
          }

          <!-- Unified Content Viewer Modal -->
          @if (activeCourse) {
            <div
              class="fixed inset-0 bg-gray-900/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <div
                class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-7xl h-[90vh] overflow-hidden flex shadow-2xl transition-colors duration-200"
              >
                <!-- Sidebar -->
                <div
                  class="w-80 bg-gray-50 dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 flex flex-col h-full flex-shrink-0 transition-colors duration-200"
                >
                  <div
                    class="p-4 border-b border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex justify-between items-center transition-colors duration-200"
                  >
                    <h3
                      class="font-bold text-gray-900 dark:text-white truncate pr-2"
                      [title]="activeCourse.title"
                    >
                      {{ activeCourse.title }}
                    </h3>
                    <button
                      (click)="closeCourseViewer()"
                      class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <mat-icon>close</mat-icon>
                    </button>
                  </div>
                  <div class="flex-1 overflow-y-auto">
                    @for (
                      subject of activeCourse.subjectDetails;
                      track subject.id;
                      let sIndex = $index
                    ) {
                      <div
                        class="border-b border-gray-200 dark:border-slate-700 transition-colors duration-200"
                      >
                        <button
                          (click)="selectSubject(subject)"
                          class="w-full flex items-center justify-between p-4 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
                          [class.bg-emerald-600]="
                            selectedSubject?.id === subject.id
                          "
                          [class.dark:bg-emerald-700]="
                            selectedSubject?.id === subject.id
                          "
                          [class.text-white]="
                            selectedSubject?.id === subject.id
                          "
                          [class.text-gray-700]="
                            selectedSubject?.id !== subject.id
                          "
                          [class.dark:text-gray-300]="
                            selectedSubject?.id !== subject.id
                          "
                        >
                          <div class="flex items-center gap-2">
                            @if (
                              completedModulesMap()[activeCourse.id]?.includes(
                                subject.id
                              )
                            ) {
                              <mat-icon
                                class="text-emerald-500"
                                [class.text-white]="
                                  selectedSubject?.id === subject.id
                                "
                                >check_circle</mat-icon
                              >
                            } @else {
                              <span
                                class="text-xs font-bold px-2 py-1 rounded-full bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400"
                                [class.bg-emerald-500]="
                                  selectedSubject?.id === subject.id
                                "
                                [class.text-white]="
                                  selectedSubject?.id === subject.id
                                "
                                >NS</span
                              >
                            }
                            <span class="font-semibold text-left">{{
                              subject.title
                            }}</span>
                          </div>
                          @if (selectedSubject?.id === subject.id) {
                            <mat-icon>chevron_right</mat-icon>
                          }
                        </button>
                      </div>
                    }
                    @if (
                      !activeCourse.subjectDetails ||
                      activeCourse.subjectDetails.length === 0
                    ) {
                      <p
                        class="text-gray-500 dark:text-gray-400 italic text-center py-8 text-sm"
                      >
                        No hay contenido estructurado.
                      </p>
                    }
                  </div>
                </div>

                <!-- Main Content Area -->
                <div
                  class="flex-1 flex flex-col h-full bg-white dark:bg-slate-800 relative transition-colors duration-200"
                >
                  @if (selectedSubject) {
                    <div
                      class="p-4 border-b border-gray-100 dark:border-slate-700 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white dark:bg-slate-800 shadow-sm z-10 gap-4 transition-colors duration-200"
                    >
                      <h2
                        class="text-xl font-bold text-gray-800 dark:text-white"
                      >
                        {{ selectedSubject.title }}
                      </h2>

                      <!-- Tabs -->
                      <div
                        class="flex gap-2 p-1 bg-gray-100 dark:bg-slate-700 rounded-lg"
                      >
                        <button
                          (click)="setTab('video')"
                          [class.bg-white]="tab === 'video'"
                          [class.text-indigo-600]="tab === 'video'"
                          [class.shadow-sm]="tab === 'video'"
                          [class.dark:bg-slate-800]="tab === 'video'"
                          [class.dark:text-indigo-400]="tab === 'video'"
                          [class.text-gray-600]="tab !== 'video'"
                          [class.hover:bg-gray-200]="tab !== 'video'"
                          [class.dark:text-gray-300]="tab !== 'video'"
                          [class.dark:hover:bg-slate-600]="tab !== 'video'"
                          class="px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2"
                        >
                          <mat-icon class="text-[18px] w-[18px] h-[18px]"
                            >play_circle</mat-icon
                          >
                          Video
                        </button>
                        <button
                          (click)="setTab('material')"
                          [class.bg-white]="tab === 'material'"
                          [class.text-red-500]="tab === 'material'"
                          [class.shadow-sm]="tab === 'material'"
                          [class.dark:bg-slate-800]="tab === 'material'"
                          [class.dark:text-red-400]="tab === 'material'"
                          [class.text-gray-600]="tab !== 'material'"
                          [class.hover:bg-gray-200]="tab !== 'material'"
                          [class.dark:text-gray-300]="tab !== 'material'"
                          [class.dark:hover:bg-slate-600]="tab !== 'material'"
                          class="px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2"
                        >
                          <mat-icon class="text-[18px] w-[18px] h-[18px]"
                            >picture_as_pdf</mat-icon
                          >
                          Material
                        </button>
                        @if (selectedSubject.exam) {
                          <button
                            (click)="setTab('examen')"
                            [class.bg-white]="tab === 'examen'"
                            [class.text-emerald-600]="tab === 'examen'"
                            [class.shadow-sm]="tab === 'examen'"
                            [class.dark:bg-slate-800]="tab === 'examen'"
                            [class.dark:text-emerald-400]="tab === 'examen'"
                            [class.text-gray-600]="tab !== 'examen'"
                            [class.hover:bg-gray-200]="tab !== 'examen'"
                            [class.dark:text-gray-300]="tab !== 'examen'"
                            [class.dark:hover:bg-slate-600]="tab !== 'examen'"
                            class="px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2"
                          >
                            <mat-icon class="text-[18px] w-[18px] h-[18px]"
                              >quiz</mat-icon
                            >
                            Examen
                          </button>
                        }
                      </div>

                      @if (
                        tab === "material" &&
                        selectedSubject.documents &&
                        selectedSubject.documents.length > 0
                      ) {
                        <a
                          tabindex="0"
                          (click)="verPDF(selectedSubject.documents[0])"
                          (keydown.enter)="verPDF(selectedSubject.documents[0])"
                          class="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400 px-4 py-2 cursor-pointer rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors text-sm font-medium hidden sm:flex"
                        >
                          <mat-icon class="text-[18px] w-[18px] h-[18px]"
                            >open_in_new</mat-icon
                          >
                          Ver PDF
                        </a>
                      }
                    </div>

                    <div
                      class="flex-1 overflow-hidden bg-gray-100 dark:bg-slate-900 relative transition-colors duration-200"
                    >
                      @if (tab === "video") {
                        @if (
                          selectedSubject.videos &&
                          selectedSubject.videos.length > 0
                        ) {
                          <div class="w-full h-full">
                            <iframe
                              [src]="sanitizeUrl(selectedSubject.videos[0])"
                              class="w-full h-full"
                              frameborder="0"
                              allowfullscreen
                            ></iframe>
                          </div>
                        } @else {
                          <div
                            class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400"
                          >
                            No hay video para este módulo
                          </div>
                        }
                      } @else if (tab === "material") {
                        @if (
                          selectedSubject.documents &&
                          selectedSubject.documents.length > 0
                        ) {
                          <div class="w-full h-full flex flex-col items-center justify-center p-8 text-center bg-gray-50 dark:bg-slate-900 border-2 border-dashed border-gray-200 dark:border-slate-700 m-4 rounded-2xl w-[calc(100%-2rem)] h-[calc(100%-2rem)]">
                            <div class="bg-indigo-100 dark:bg-indigo-900/40 p-6 rounded-full mb-6">
                              <mat-icon class="text-indigo-600 dark:text-indigo-400 text-6xl w-16 h-16 flex items-center justify-center translate-y-2">picture_as_pdf</mat-icon>
                            </div>
                            <h3 class="text-2xl font-bold text-gray-800 dark:text-white mb-2">Material de Estudio</h3>
                            <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-md">Para visualizar u obtener este documento, haz clic en el botón a continuación. Se abrirá de forma segura en una nueva pestaña.</p>
                            
                            <div class="flex gap-4">
                              <button
                                (click)="verPDF(selectedSubject.documents[0])"
                                class="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all hover:shadow-lg hover:-translate-y-1"
                              >
                                <mat-icon>open_in_new</mat-icon>
                                Ver PDF
                              </button>
                              
                              <button
                                (click)="descargarArchivo(selectedSubject.documents[0])"
                                class="bg-white border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 px-8 py-3 rounded-xl font-medium flex items-center gap-2 transition-all hover:shadow-lg hover:-translate-y-1"
                              >
                                <mat-icon>file_download</mat-icon>
                                Descargar PDF
                              </button>
                            </div>
                          </div>
                        } @else {
                          <div
                            class="flex items-center justify-center h-full text-gray-500 dark:text-gray-400"
                          >
                            No hay material para este módulo
                          </div>
                        }
                      } @else if (tab === "examen" && activeExam) {
                        <div
                          class="h-full overflow-y-auto p-8 bg-white dark:bg-slate-800 flex flex-col transition-colors duration-200"
                        >
                          @if (!examFinished) {
                            <div
                              class="max-w-3xl mx-auto w-full flex-1 flex flex-col"
                            >
                              <div class="mb-6">
                                <div
                                  class="flex justify-between text-sm text-gray-500 dark:text-gray-400 mb-2"
                                >
                                  <span
                                    >Pregunta {{ currentQuestionIndex + 1 }} de
                                    {{ activeExam.questions.length }}</span
                                  >
                                </div>
                                <div
                                  class="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2 mb-8"
                                >
                                  <div
                                    class="bg-indigo-600 dark:bg-indigo-500 h-2 rounded-full transition-all duration-300"
                                    [style.width.%]="
                                      (currentQuestionIndex /
                                        activeExam.questions.length) *
                                      100
                                    "
                                  ></div>
                                </div>

                                <h4
                                  class="text-2xl font-medium text-gray-900 dark:text-white mb-8"
                                >
                                  {{
                                    activeExam.questions[currentQuestionIndex]
                                      .question
                                  }}
                                </h4>

                                <div class="space-y-4">
                                  @for (
                                    option of activeExam.questions[
                                      currentQuestionIndex
                                    ].options;
                                    track option;
                                    let i = $index
                                  ) {
                                    <button
                                      (click)="selectOption(i)"
                                      [class.border-indigo-600]="
                                        selectedOptionIndex === i
                                      "
                                      [class.dark:border-indigo-500]="
                                        selectedOptionIndex === i
                                      "
                                      [class.bg-indigo-50]="
                                        selectedOptionIndex === i
                                      "
                                      [class.dark:bg-indigo-900/30]="
                                        selectedOptionIndex === i
                                      "
                                      [class.border-gray-200]="
                                        selectedOptionIndex !== i
                                      "
                                      [class.dark:border-slate-600]="
                                        selectedOptionIndex !== i
                                      "
                                      [class.hover:border-indigo-300]="
                                        selectedOptionIndex !== i
                                      "
                                      [class.dark:hover:border-indigo-700]="
                                        selectedOptionIndex !== i
                                      "
                                      class="w-full text-left p-5 rounded-xl border-2 transition-all duration-200 flex items-center gap-4"
                                    >
                                      <div
                                        class="w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0"
                                        [class.border-indigo-600]="
                                          selectedOptionIndex === i
                                        "
                                        [class.dark:border-indigo-500]="
                                          selectedOptionIndex === i
                                        "
                                        [class.border-gray-300]="
                                          selectedOptionIndex !== i
                                        "
                                        [class.dark:border-slate-500]="
                                          selectedOptionIndex !== i
                                        "
                                      >
                                        @if (selectedOptionIndex === i) {
                                          <div
                                            class="w-3 h-3 rounded-full bg-indigo-600 dark:bg-indigo-500"
                                          ></div>
                                        }
                                      </div>
                                      <span
                                        class="text-gray-700 dark:text-gray-300 text-lg"
                                        >{{ option }}</span
                                      >
                                    </button>
                                  }
                                </div>
                              </div>

                              <div class="mt-auto pt-8 flex justify-end">
                                <button
                                  (click)="nextQuestion()"
                                  [disabled]="selectedOptionIndex === null"
                                  class="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-lg shadow-sm"
                                >
                                  {{
                                    currentQuestionIndex ===
                                    activeExam.questions.length - 1
                                      ? "Finalizar Examen"
                                      : "Siguiente Pregunta"
                                  }}
                                  <mat-icon>{{
                                    currentQuestionIndex ===
                                    activeExam.questions.length - 1
                                      ? "done_all"
                                      : "arrow_forward"
                                  }}</mat-icon>
                                </button>
                              </div>
                            </div>
                          } @else {
                            <div
                              class="text-center max-w-md mx-auto py-12 flex-1 flex flex-col justify-center"
                            >
                              <div
                                class="w-32 h-32 rounded-full flex items-center justify-center mx-auto mb-8"
                                [class.bg-emerald-100]="examScore >= 70"
                                [class.dark:bg-emerald-900/30]="examScore >= 70"
                                [class.text-emerald-600]="examScore >= 70"
                                [class.dark:text-emerald-400]="examScore >= 70"
                                [class.bg-red-100]="examScore < 70"
                                [class.dark:bg-red-900/30]="examScore < 70"
                                [class.text-red-600]="examScore < 70"
                                [class.dark:text-red-400]="examScore < 70"
                              >
                                <mat-icon
                                  class="text-6xl w-16 h-16 flex items-center justify-center"
                                  >{{
                                    examScore >= 70
                                      ? "emoji_events"
                                      : "sentiment_dissatisfied"
                                  }}</mat-icon
                                >
                              </div>
                              <h3
                                class="text-3xl font-bold text-gray-900 dark:text-white mb-4"
                              >
                                {{
                                  examScore >= 70
                                    ? "¡Felicidades!"
                                    : "Sigue intentando"
                                }}
                              </h3>
                              <p
                                class="text-gray-600 dark:text-gray-400 mb-8 text-lg"
                              >
                                Has obtenido un
                                <span
                                  class="font-bold text-2xl"
                                  [class.text-emerald-600]="examScore >= 70"
                                  [class.dark:text-emerald-400]="
                                    examScore >= 70
                                  "
                                  [class.text-red-600]="examScore < 70"
                                  [class.dark:text-red-400]="examScore < 70"
                                  >{{ examScore }}%</span
                                >
                                en el examen.
                              </p>

                              <button
                                (click)="goToNextContent()"
                                class="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-4 rounded-xl font-medium transition-colors text-lg shadow-sm"
                              >
                                {{
                                  hasNextSubject()
                                    ? "Siguiente Módulo"
                                    : "Volver al Contenido"
                                }}
                              </button>
                            </div>
                          }
                        </div>
                      }
                    </div>
                  } @else {
                    <div
                      class="flex-1 flex flex-col items-center justify-center text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-slate-900 transition-colors duration-200"
                    >
                      <mat-icon
                        class="text-6xl mb-4 text-gray-300 dark:text-gray-600"
                        >touch_app</mat-icon
                      >
                      <p class="text-lg text-gray-500 dark:text-gray-400">
                        Selecciona un contenido del menú lateral para comenzar
                      </p>
                    </div>
                  }
                </div>
              </div>
            </div>
          }

          <!-- Add Course Modal -->
          @if (showAddCourseModal) {
            <div
              class="fixed inset-0 bg-gray-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <div
                class="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl transition-colors duration-200"
              >
                <div
                  class="p-4 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center bg-gray-50 dark:bg-slate-900 transition-colors duration-200"
                >
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">
                    Añadir Nuevo Curso
                  </h3>
                  <button
                    (click)="showAddCourseModal = false"
                    class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <mat-icon>close</mat-icon>
                  </button>
                </div>
                <div class="p-6">
                  <div class="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                    @for (course of courseService.courses(); track course.id) {
                      @if (!user.enrolledCourses.includes(course.id)) {
                        <div
                          class="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors"
                        >
                          <div class="flex items-center gap-3">
                            @if (course.imageUrl) {
                              <img
                                [src]="course.imageUrl"
                                alt=""
                                class="w-12 h-12 rounded-lg object-cover"
                                referrerpolicy="no-referrer"
                              />
                            } @else {
                              <div
                                class="w-12 h-12 rounded-lg bg-indigo-50 dark:bg-slate-700 flex items-center justify-center"
                              >
                                <mat-icon class="text-indigo-400"
                                  >school</mat-icon
                                >
                              </div>
                            }
                            <div>
                              <h4
                                class="font-bold text-sm text-gray-900 dark:text-white"
                              >
                                {{ course.title }}
                              </h4>
                              <p
                                class="text-xs text-gray-500 dark:text-gray-400"
                              >
                                {{ course.subjects.length }} Asignaturas
                              </p>
                            </div>
                          </div>
                          <button
                            (click)="enrollCourse(course.id)"
                            class="text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 p-2 rounded-lg transition-colors"
                          >
                            <mat-icon>add_circle</mat-icon>
                          </button>
                        </div>
                      }
                    }
                  </div>
                </div>
              </div>
            </div>
          }
        } @else {
          <div class="text-center py-20">
            <p class="text-gray-600 dark:text-gray-400">
              Por favor, inicia sesión para ver tu panel.
            </p>
          </div>
        }
      </div>
    </main>
  `,
})
export class DashboardComponent implements OnInit {
  auth = inject(AuthService);
  courseService = inject(CourseService);
  fileService = inject(FileService);
  router = inject(Router);
  sanitizer = inject(DomSanitizer);
  fb = inject(FormBuilder);
  cdr = inject(ChangeDetectorRef);

  user: User | null = null;
  activeCourse: Course | null = null;
  showAddCourseModal = false;
  activeTab: "courses" | "profile" = "courses";
  profileUpdateSuccess = false;

  profileForm: FormGroup = this.fb.group({
    name: ["", Validators.required],
    email: ["", [Validators.required, Validators.email]],
    photoUrl: ["", Validators.required],
  });

  activeExam: Exam | null = null;
  activeSubject: SubjectDetail | null = null;
  currentQuestionIndex = 0;
  selectedOptionIndex: number | null = null;
  examScore = 0;
  examFinished = false;

  // New Viewer State
  selectedSubject: SubjectDetail | null = null;
  tab: "video" | "material" | "examen" = "video";
  expandedSubjects = new Set<string>();

  courseProgressMap = signal<Record<string, number>>({});
  courseGradesMap = signal<Record<string, Record<string, number>>>({});
  completedModulesMap = signal<Record<string, string[]>>({});

  certCourseTitle = "";

  ngOnInit() {
    this.user = this.auth.currentUser();
    if (this.user) {
      this.profileForm.patchValue({
        name: this.user.name,
        email: this.user.email,
        photoUrl: this.user.photoUrl,
      });
      this.loadAllProgress();
    }
  }

  loadAllProgress() {
    if (!this.user) return;
    for (const courseId of this.user.enrolledCourses) {
      this.calculateCourseProgress(courseId);
    }
  }

  calculateCourseProgress(courseId: string, autoRedirect = false) {
    const currentUser = this.user;
    if (!currentUser) return;
    const course = this.getCourse(courseId);
    if (!course) return;

    this.courseService
      .getCompletedModules(currentUser.id, courseId)
      .subscribe((completedModuleIds) => {
        this.courseService
          .getExamResults(currentUser.id, courseId)
          .subscribe((examRes) => {
            let totalModules = 0;
            let completedModulesCount = 0;

            const examScores = new Map(examRes.map((e) => [e.examId, e.score]));
            const subjectGrades: Record<string, number> = {};

            if (course.subjectDetails) {
              course.subjectDetails.forEach((subject) => {
                totalModules++;
                const moduleCompleted = completedModuleIds.includes(subject.id);

                if (subject.exam) {
                  if (examScores.has(subject.exam.id)) {
                    const score = examScores.get(subject.exam.id)!;
                    subjectGrades[subject.title] = score;
                  }
                }

                if (moduleCompleted) {
                  completedModulesCount++;
                }
              });
            }

            let progress = 0;
            if (totalModules > 0) {
              progress = Math.round(
                (completedModulesCount / totalModules) * 100,
              );
            }

            this.courseProgressMap.update((map) => ({
              ...map,
              [courseId]: progress,
            }));
            this.courseGradesMap.update((map) => ({
              ...map,
              [courseId]: subjectGrades,
            }));
            this.completedModulesMap.update((map) => ({
              ...map,
              [courseId]: completedModuleIds,
            }));

            if (progress === 100) {
              this.courseService
                .saveDiploma(currentUser.id, currentUser.name, courseId)
                .subscribe({
                  next: (res) => {
                    if (autoRedirect && res.success && res.codigo_certificado) {
                      this.router.navigate(["/verify", res.codigo_certificado]);
                    }
                  },
                });
            }
          });
      });
  }

  onProfilePhotoSelected(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.courseService.uploadImage(file).subscribe({
        next: (res) => {
          this.profileForm.patchValue({ photoUrl: res.url });
          this.profileForm.markAsDirty();
          this.cdr.detectChanges();
        },
        error: (err) => console.error("Error uploading image", err),
      });
    }
  }

  handleImageError(event: Event) {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = "https://picsum.photos/seed/user/200/200";
    }
  }

  updateProfile() {
    if (this.profileForm.invalid || !this.user) return;

    const formValue = this.profileForm.value;
    const updatedUser = {
      ...this.user,
      name: formValue.name,
      email: formValue.email,
      photoUrl: formValue.photoUrl,
    };

    this.auth.updateUser(updatedUser);
    this.user = updatedUser;

    this.profileForm.markAsPristine();
    this.profileUpdateSuccess = true;
    setTimeout(() => (this.profileUpdateSuccess = false), 3000);
  }

  getCourse(id: string): Course | undefined {
    return this.courseService.courses().find((c) => c.id === id);
  }

  getGrade(courseId: string, subject: string): number {
    const courseGrades = this.courseGradesMap()[courseId];
    return courseGrades ? courseGrades[subject] || 0 : 0;
  }

  getCourseProgress(courseId: string): number {
    return this.courseProgressMap()[courseId] || 0;
  }

  viewCourseContent(course: Course) {
    this.activeCourse = course;
    this.expandedSubjects.clear();

    // Auto-select first available content
    if (course.subjectDetails && course.subjectDetails.length > 0) {
      const firstSubject = course.subjectDetails[0];
      this.selectSubject(firstSubject);
    }
  }

  closeCourseViewer() {
    this.activeCourse = null;
    this.activeExam = null;
    this.selectedSubject = null;
    this.tab = "video";
  }

  selectSubject(subject: SubjectDetail) {
    this.selectedSubject = subject;
    this.tab = "video";

    // Check completion for progress
    if (
      this.user &&
      this.activeCourse &&
      subject.videos &&
      subject.videos.length > 0
    ) {
      this.courseService
        .markContentAsCompleted(
          this.user.id,
          this.activeCourse.id,
          subject.videos[0],
        )
        .subscribe(() => {
          this.calculateCourseProgress(this.activeCourse!.id);
        });
    }

    if (subject.exam) {
      this.startExam(this.activeCourse!.id, subject);
    } else {
      this.activeExam = null;
    }
  }

  setTab(newTab: "video" | "material" | "examen") {
    this.tab = newTab;
    if (
      newTab === "examen" &&
      this.selectedSubject &&
      this.selectedSubject.exam
    ) {
      this.startExam(this.activeCourse!.id, this.selectedSubject);
    }

    // Mark as completed if checking out
    if (
      newTab === "video" &&
      this.user &&
      this.activeCourse &&
      this.selectedSubject?.videos &&
      this.selectedSubject.videos.length > 0
    ) {
      this.courseService
        .markContentAsCompleted(
          this.user.id,
          this.activeCourse.id,
          this.selectedSubject.videos[0],
        )
        .subscribe(() => {
          this.calculateCourseProgress(this.activeCourse!.id);
        });
    } else if (
      newTab === "material" &&
      this.user &&
      this.activeCourse &&
      this.selectedSubject?.documents &&
      this.selectedSubject.documents.length > 0
    ) {
      this.courseService
        .markContentAsCompleted(
          this.user.id,
          this.activeCourse.id,
          this.selectedSubject.documents[0],
        )
        .subscribe(() => {
          this.calculateCourseProgress(this.activeCourse!.id);
        });
    }
  }

  hasNextSubject(): boolean {
    if (
      !this.activeCourse ||
      !this.selectedSubject ||
      !this.activeCourse.subjectDetails
    )
      return false;
    const currentIndex = this.activeCourse.subjectDetails.findIndex(
      (s) => s.id === this.selectedSubject!.id,
    );
    return (
      currentIndex >= 0 &&
      currentIndex < this.activeCourse.subjectDetails.length - 1
    );
  }

  goToNextContent() {
    if (
      !this.activeCourse ||
      !this.selectedSubject ||
      !this.activeCourse.subjectDetails
    )
      return;
    const currentIndex = this.activeCourse.subjectDetails.findIndex(
      (s) => s.id === this.selectedSubject!.id,
    );

    if (
      currentIndex >= 0 &&
      currentIndex < this.activeCourse.subjectDetails.length - 1
    ) {
      const nextSubject = this.activeCourse.subjectDetails[currentIndex + 1];
      this.selectSubject(nextSubject);
    } else {
      this.closeCourseViewer();
    }
  }

  sanitizeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  verPDF(doc: string) {
    if (!doc) return;
    const nombre = doc.split('/').pop();

    fetch('/api/pdf-file/' + nombre)
      .then(res => res.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      })
      .catch(() => alert('No se pudo abrir el PDF'));
  }

  descargarArchivo(doc: string) {
    if (!doc) return;
    const nombre = doc.split('/').pop();
    if (!nombre) return;
    
    this.fileService.downloadPdf(nombre).subscribe({
      next: (blob) => {
        this.fileService.downloadFile(blob, nombre);
      },
      error: () => alert('Error al descargar el archivo')
    });
  }

  enrollCourse(courseId: string) {
    if (this.user && !this.user.enrolledCourses.includes(courseId)) {
      const updatedUser = { ...this.user };
      updatedUser.enrolledCourses.push(courseId);

      if (!updatedUser.grades[courseId]) {
        updatedUser.grades[courseId] = {};
      }

      this.auth.updateUser(updatedUser);
      this.user = updatedUser;
      this.showAddCourseModal = false;
      this.calculateCourseProgress(courseId);
    }
  }

  startExam(courseId: string, subject: SubjectDetail) {
    if (subject.exam) {
      this.activeSubject = subject;
      this.activeExam = subject.exam;
      this.currentQuestionIndex = 0;
      this.selectedOptionIndex = null;
      this.examScore = 0;
      this.examFinished = false;
    }
  }

  selectOption(index: number) {
    this.selectedOptionIndex = index;
  }

  nextQuestion() {
    if (this.selectedOptionIndex === null || !this.activeExam) return;

    if (
      this.selectedOptionIndex ===
      this.activeExam.questions[this.currentQuestionIndex].correctOptionIndex
    ) {
      this.examScore += 100 / this.activeExam.questions.length;
    }

    if (this.currentQuestionIndex < this.activeExam.questions.length - 1) {
      this.currentQuestionIndex++;
      this.selectedOptionIndex = null;
    } else {
      this.finishExam();
    }
  }

  finishExam() {
    this.examFinished = true;
    this.examScore = Math.round(this.examScore);

    if (
      this.user &&
      this.activeCourse &&
      this.activeSubject &&
      this.activeExam
    ) {
      this.courseService
        .saveExamResult(
          this.user.id,
          this.activeCourse.id,
          this.activeExam.id,
          this.examScore,
        )
        .subscribe(() => {
          this.calculateCourseProgress(this.activeCourse!.id, true);
        });

      const updatedUser = { ...this.user };
      if (!updatedUser.grades[this.activeCourse.id]) {
        updatedUser.grades[this.activeCourse.id] = {};
      }

      const currentGrade =
        updatedUser.grades[this.activeCourse.id][this.activeSubject.title] || 0;
      if (this.examScore > currentGrade) {
        updatedUser.grades[this.activeCourse.id][this.activeSubject.title] =
          this.examScore;
        this.auth.updateUser(updatedUser);
        this.user = updatedUser;
      }
    }
  }

  closeExam() {
    this.activeExam = null;
    this.activeSubject = null;
  }

  async generateCertificate(course: Course) {
    if (!this.user) return;

    this.courseService
      .saveDiploma(this.user.id, this.user.name, course.id)
      .subscribe({
        next: (res) => {
          if (res.success && res.codigo_certificado) {
            this.router.navigate([
              "/verificar-certificado",
              res.codigo_certificado,
            ]);
          }
        },
        error: (err) => {
          console.error("Error generating diploma", err);
        },
      });
  }
}
