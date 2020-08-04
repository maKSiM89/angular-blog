import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {FirebaseAuthResponse, User} from '../../../shared/interfaces';
import {Observable, Subject, throwError} from 'rxjs';
import {environment} from '../../../../environments/environment';
import {catchError, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  error$: Subject<string> = new Subject<string>();

  constructor(private http: HttpClient) {}

  get token(): string {
    const expiresDate: Date = new Date(localStorage.getItem('firebase-token-expires-date'));

    if (new Date() > expiresDate) {
      this.logout();

      return null;
    }

    return localStorage.getItem('firebase-token');
  }

  login(user: User): Observable<any> {
    return this.http.post(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.apiKey}`, user)
     .pipe(
       tap(this.setToken),
       catchError(this.handleError.bind(this))
     );
  }

  logout(): void {
    this.setToken(null);
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  private handleError(error: HttpErrorResponse) {
    const {message} = error.error.error;

    console.log(message);

    switch (message) {
      case 'INVALID_PASSWORD':
        this.error$.next('Password is wrong');
        break;
      case 'INVALID_EMAIL':
        this.error$.next('Email is wrong');
        break;
      case 'EMAIL_NOT_FOUND':
        this.error$.next('Email is not found');
        break;
    }

    return throwError(message);
  }

  private setToken(response: FirebaseAuthResponse | null): void {
    if (response) {
      const expiresDate: Date = new Date(
        new Date().getTime() + +response.expiresIn * 1000
      );

      localStorage.setItem('firebase-token', response.idToken);
      localStorage.setItem('firebase-token-expires-date', expiresDate.toString());
    } else {
      localStorage.clear();
    }
  }
}
