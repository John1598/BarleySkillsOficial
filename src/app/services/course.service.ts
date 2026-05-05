  import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';

export interface ExamQuestion {
  question: string;
  options: string[];
  correctOptionIndex: number;
}

export interface Exam {
  id: string;
  title: string;
  questions: ExamQuestion[];
}

export interface SubjectDetail {
  id: string;
  title: string;
  videos: string[];
  documents: string[];
  exam?: Exam;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  subjects: string[];
  subjectDetails?: SubjectDetail[];
  internalContent?: {
    videos: string[];
    documents: string[];
  };
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private http = inject(HttpClient);
  courses = signal<Course[]>([]);

  constructor() {
    this.loadCourses();
  }

  private loadCourses() {
    this.http.get<Course[]>('/api/courses').subscribe({
      next: (data) => {
        this.courses.set(data);
      },
      error: (err) => {
        console.error('Error loading courses:', err);
      }
    });
  }

  getCourse(id: string): Course | undefined {
    return this.courses().find(c => c.id === id);
  }

  addCourse(course: Course) {
    return this.http.post<Course>('/api/courses', course).pipe(
      tap((newCourse) => {
        this.courses.update(courses => [...courses, newCourse]);
      })
    );
  }

  updateCourse(updatedCourse: Course) {
    return this.http.put<Course>(`/api/courses/${updatedCourse.id}`, updatedCourse).pipe(
      tap((course) => {
        this.courses.update(courses => courses.map(c => c.id === course.id ? course : c));
      })
    );
  }

  deleteCourse(id: string) {
    return this.http.delete(`/api/courses/${id}`).pipe(
      tap(() => {
        this.courses.update(courses => courses.filter(c => c.id !== id));
      })
    );
  }

  // Progress Tracking
  markContentAsCompleted(userId: string, courseId: string, contentId: string) {
    return this.http.post('/api/progress', { userId, courseId, contentId });
  }

  getCompletedContent(userId: string, courseId: string) {
    return this.http.get<{completedContentIds: string[]}>(`/api/progress/${userId}/${courseId}`);
  }

  getCompletedModules(userId: string, courseId: string) {
    return this.http.get<string[]>(`/api/completed-modules/${userId}/${courseId}`);
  }

  // Exam Results
  saveExamResult(userId: string, courseId: string, examId: string, score: number) {
    return this.http.post('/api/exam-results', { userId, courseId, examId, score });
  }

  getExamResults(userId: string, courseId: string) {
    return this.http.get<{examId: string, score: number}[]>(`/api/exam-results/${userId}/${courseId}`);
  }

  // Diplomas
  saveDiploma(userId: string, userName: string, courseId: string) {
    return this.http.post<{success: boolean, codigo_certificado: string}>('/api/diplomas', { userId, userName, courseId });
  }

  getDiplomas(userId: string) {
    return this.http.get<string[]>(`/api/diplomas/${userId}`);
  }

  verifyCertificate(codigo: string) {
    return this.http.get<{codigo_certificado: string, fecha: string, usuario_nombre: string, curso_nombre: string}>(`/api/verify-certificate/${codigo}`);
  }

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<{url: string}>('/api/upload', formData);
  }

  uploadPdf(file: File) {
    const formData = new FormData();
    formData.append('pdf', file);
    return this.http.post<{url: string}>('/api/upload-pdf', formData);
  }
}
