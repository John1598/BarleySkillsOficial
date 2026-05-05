import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FileService {
  private http = inject(HttpClient);

  downloadPdf(fileName: string): Observable<Blob> {
    return this.http.get(`/api/pdf-file/${fileName}`, { responseType: 'blob' });
  }

  downloadFile(data: Blob, fileName: string): void {
    const url = window.URL.createObjectURL(data);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
