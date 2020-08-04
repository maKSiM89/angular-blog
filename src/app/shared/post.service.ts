import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {FirebaseCreateResponse, Post} from './interfaces';
import {environment} from '../../environments/environment';
import {map, tap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  constructor(private http: HttpClient) {
  }

  create(post: Post): Observable<Post> {
    return this.http.post(`${environment.firebaseDbUrl}/posts.json`, post)
      .pipe(map((response: FirebaseCreateResponse) => {
        return {
          ...post,
          id: response.name,
          date: new Date(post.date)
        };
      }));
  }

  getAll(): Observable<Post[]> {
    return this.http.get<Post[]>(`${environment.firebaseDbUrl}/posts.json`)
      .pipe(
        map((response: {[key: string]: any}) => {
          return Object
            .keys(response)
            .map(key => ({
              ...response[key],
              id: key,
              date: new Date(response[key].date)
            }));
        })
      );

  }

  remove(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.firebaseDbUrl}/posts/${id}.json`);
  }

  getByID(id: string): Observable<Post> {
    return this.http.get<Post>(`${environment.firebaseDbUrl}/posts/${id}.json`)
      .pipe(map((post: Post) => {
        return {
          ...post,
          id,
          date: new Date(post.date)
        };
      }));
  }

  update(post: Post): Observable<Post> {
    return this.http.patch<Post>(`${environment.firebaseDbUrl}/posts/${post.id}.json`, post);
  }
}
