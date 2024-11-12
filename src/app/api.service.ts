import { Injectable } from '@angular/core';
import { HttpClient,HttpHeaders, HttpParams } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { promises } from 'dns';
import { multiFactor } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private apiUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  getDepartments(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/departments`);
  }

  getDoctors(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/api/doctors`);
  }

  getAvailableSlots(docId: number, date: string): Observable<any> {
    const availabilityUrl = `${this.apiUrl}/avail/doctors/availability/${docId}/${date}`;
    return this.http.get<any>(availabilityUrl);
  }

  postImage(imageFile: File): Observable<any> {
    const formData = new FormData();
    formData.append('image', imageFile, imageFile.name); // 'image' is the key expected by the backend
  
    return this.http.post<any>(`${this.apiUrl}/storage/upload`, formData);
  }

  appointMail(formdata : any) : Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/mail/appointment`, formdata , {
      headers : new HttpHeaders({
        'enctype': 'multipart/form-data'
      })
    })
  }

  doorstepmail(formData : FormData) : Observable<any>{
    return this.http.post<any>(`${this.apiUrl}/mail/deliverymail`, formData)
  }

  createAppointment(appointmentData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/api/create-appointment`, appointmentData);
  }

}