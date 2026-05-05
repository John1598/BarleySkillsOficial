import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface User {
  id: string;
  name: string;
  email: string;
  photoUrl: string;
  role: 'student' | 'admin' | 'super_admin';
  enrolledCourses: string[];
  grades: Record<string, Record<string, number>>; // courseId -> subject -> grade
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  currentUser = signal<User | null>(null);
  users = signal<User[]>([]);

  constructor() {
    this.refreshUsers();

    if (typeof localStorage !== 'undefined') {
      const storedCurrentUser = localStorage.getItem('currentUser');
      if (storedCurrentUser) {
        const parsedCurrent = JSON.parse(storedCurrentUser);
        if (parsedCurrent.email === 'admin@barleyskills.edu' && parsedCurrent.role === 'admin') {
          parsedCurrent.role = 'super_admin';
          localStorage.setItem('currentUser', JSON.stringify(parsedCurrent));
        }
        this.currentUser.set(parsedCurrent);
      }
    }
  }

  async refreshUsers() {
    try {
      const dbUsers = await firstValueFrom(this.http.get<User[]>('/api/users'));
      this.users.set(dbUsers);
    } catch (e) {
      console.error('Error fetching users', e);
    }
  }

  async login(email: string, password: string): Promise<boolean> {
    if (!password) return false;
    
    try {
      const user = await firstValueFrom(this.http.post<User>('/api/auth/login', { email, password }));
      if (user) {
        this.currentUser.set(user);
        localStorage.setItem('currentUser', JSON.stringify(user));
        return true;
      }
      return false;
    } catch (e) {
      console.error('Login error', e);
      return false;
    }
  }

  async register(user: Omit<User, 'id'>, password?: string): Promise<boolean> {
    try {
      await firstValueFrom(this.http.post('/api/auth/register', { ...user, password: password || 'default123' }));
      await this.refreshUsers();
      return this.login(user.email, password || 'default123');
    } catch {
      return false;
    }
  }

  logout() {
    this.currentUser.set(null);
    localStorage.removeItem('currentUser');
  }

  async updateUser(updatedUser: User) {
    try {
      await firstValueFrom(this.http.put('/api/users/' + updatedUser.id, updatedUser));
      await this.refreshUsers();
      if (this.currentUser()?.id === updatedUser.id) {
        this.currentUser.set(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    } catch (e) {
      console.error(e);
    }
  }

  async deleteUser(id: string) {
    try {
      const current = this.currentUser();
      const callerId = current ? current.id : '';
      await firstValueFrom(this.http.delete(`/api/users/${id}?callerId=${callerId}`));
      await this.refreshUsers();
      if (this.currentUser()?.id === id) {
        this.logout();
      }
    } catch(e) {
      console.error(e);
      throw e;
    }
  }

  async updateUserRole(id: string, role: string) {
    try {
      await firstValueFrom(this.http.put('/api/usuarios/' + id + '/rol', { rol: role, callerId: this.currentUser()?.id }));
      await this.refreshUsers();
      
      const updatedUser = this.users().find(u => u.id === id);
      if (updatedUser && this.currentUser()?.id === id) {
        this.currentUser.set(updatedUser);
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
      }
    } catch(e) {
      console.error(e);
      throw e;
    }
  }
}
