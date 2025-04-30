import { Injectable } from '@angular/core';
import { User } from './interfaces/user';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<User>({ pseudo: 'Invité', avatar: 'I' });
  public user$: Observable<User> = this.userSubject.asObservable();

  constructor() {
    // Load user data from localStorage on service initialization
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const savedUser = localStorage.getItem('chatUser');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser) as User;
        this.userSubject.next(userData);
      } catch (err) {
        console.error('Error parsing user data from localStorage', err);
      }
    }
  }

  /**
   * Update user information
   * @param user The updated user information
   */
  updateUser(user: User): void {
    localStorage.setItem('chatUser', JSON.stringify(user));
    this.userSubject.next(user);
  }

  /**
   * Get current user information
   * @returns The current user
   */
  getCurrentUser(): User {
    return this.userSubject.value;
  }
}
